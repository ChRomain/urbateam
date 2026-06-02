'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Calendar, Clock, ArrowRight, Loader, FileText, CheckCircle, AlertTriangle, Compass, Ruler, Move, Home, MapPin, Phone, Mail } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import * as THREE from 'three';
import { jsPDF } from 'jspdf';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../context/LanguageContext';
import GlassCard from '../../components/GlassCard';
import PageHeader from '../../components/PageHeader';
import styles from './SimulateurEnsoleillementClient.module.css';

// --- CONFIGURATION GÉOGRAPHIQUE & ASTRONOMIQUE ---
const LATITUDE_FINISTERE = 48.39; // Brest / Finistère

function getSolarPosition(monthIndex, hourDecimal) {
  const rad = Math.PI / 180;
  
  // Jour moyen de l'année pour chaque mois
  const dayOfYear = [15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345][monthIndex];
  
  // 1. Déclinaison du Soleil (delta) - inclinaison terrestre de 23.45°
  const declination = 23.45 * Math.sin(rad * (360 / 365 * (dayOfYear - 80)));
  
  // 2. Angle Horaire (H) - le soleil tourne de 15° par heure, 12h = 0°
  const H = 15 * (hourDecimal - 12);
  
  const latRad = LATITUDE_FINISTERE * rad;
  const decRad = declination * rad;
  const hRad = H * rad;
  
  // 3. Calcul de l'altitude solaire (alpha)
  const sinAltitude = Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad) * Math.cos(hRad);
  let altitude = Math.asin(sinAltitude) / rad;
  
  // 4. Calcul de l'azimut solaire (theta)
  let cosAzimuth = (Math.sin(decRad) - Math.sin(latRad) * sinAltitude) / (Math.cos(latRad) * Math.cos(altitude * rad));
  cosAzimuth = Math.max(-1, Math.min(1, cosAzimuth)); // Clamping de sécurité
  let azimuth = Math.acos(cosAzimuth) / rad;
  
  if (H > 0) {
    azimuth = 360 - azimuth;
  }
  
  return { azimuth, altitude };
}

// --- ALGORITHME GÉOMÉTRIQUE DE DÉTECTION D'OMBRE ---
// Vérifie si un rayon partant d'un capteur S vers le Soleil L intersecte une boîte (boîte du voisin)
// C = Centre de la boîte, angleY = rotation sur l'axe Y, E = demi-dimensions (half-extents)
function checkRayBoxIntersection(S, L, C, angleY, E) {
  // Translation dans le repère local de la boîte
  const dx = S.x - C.x;
  const dy = S.y - C.y;
  const dz = S.z - C.z;
  
  // Rotation inverse (autour de l'axe Y) pour aligner la boîte avec les axes AABB
  const cosY = Math.cos(-angleY);
  const sinY = Math.sin(-angleY);
  
  const Ox = dx * cosY - dz * sinY;
  const Oy = dy;
  const Oz = dx * sinY + dz * cosY;
  
  const Dx = L.x * cosY - L.z * sinY;
  const Dy = L.y;
  const Dz = L.x * sinY + L.z * cosY;
  
  let tmin = 0;
  let tmax = Infinity;
  
  // Test d'intersection sur l'axe X
  if (Math.abs(Dx) < 1e-6) {
    if (Ox < -E.x || Ox > E.x) return false;
  } else {
    let t1 = (-E.x - Ox) / Dx;
    let t2 = (E.x - Ox) / Dx;
    if (t1 > t2) { const temp = t1; t1 = t2; t2 = temp; }
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return false;
  }
  
  // Test d'intersection sur l'axe Y
  if (Math.abs(Dy) < 1e-6) {
    if (Oy < -E.y || Oy > E.y) return false;
  } else {
    let t1 = (-E.y - Oy) / Dy;
    let t2 = (E.y - Oy) / Dy;
    if (t1 > t2) { const temp = t1; t1 = t2; t2 = temp; }
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return false;
  }
  
  // Test d'intersection sur l'axe Z
  if (Math.abs(Dz) < 1e-6) {
    if (Oz < -E.z || Oz > E.z) return false;
  } else {
    let t1 = (-E.z - Oz) / Dz;
    let t2 = (E.z - Oz) / Dz;
    if (t1 > t2) { const temp = t1; t1 = t2; t2 = temp; }
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return false;
  }
  
  return tmax > 0;
}

export default function SimulateurEnsoleillementClient() {
  const { t, language } = useLanguage();
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  
  // --- ÉTATS DE CONFIGURATION DU MODÈLE ---
  const [activeTab, setActiveTab] = useState('voisin'); // 'voisin' ou 'propriete'

  // Maison principale (Fixe au centre de la parcelle)
  const [houseHeight, setHouseHeight] = useState(6);
  const [houseWidth, setHouseWidth] = useState(8);
  const [houseDepth, setHouseDepth] = useState(8);
  const [houseRotation, setHouseRotation] = useState(0); // Orientation (0 = Face au Sud)

  // Projet voisin (Personnalisable)
  const [neighborHeight, setNeighborHeight] = useState(10);
  const [neighborWidth, setNeighborWidth] = useState(10);
  const [neighborDepth, setNeighborDepth] = useState(8);
  const [neighborDistance, setNeighborDistance] = useState(6); // Distance par rapport à la maison
  const [neighborAngle, setNeighborAngle] = useState(135); // Angle en degrés (0 = Sud, 90 = Est, 180 = Nord, 270 = Ouest)
  const [neighborRotation, setNeighborRotation] = useState(0); // Propre rotation du voisin

  // Paramètres de simulation temporelle
  const [monthIndex, setMonthIndex] = useState(5); // Juin (5) par défaut
  const [hour, setHour] = useState(12); // Midi par défaut
  const [isPlaying, setIsPlaying] = useState(false); // Animation journalière

  // --- ÉTATS CAPTURE DE LEADS & SIMULATION ---
  const [clientAddress, setClientAddress] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientMessage, setClientMessage] = useState('');
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [leadError, setLeadError] = useState('');

  // Noms des mois en français
  const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  // --- CAPTEURS D'ENSOLEILLEMENT (Positions 3D sur la maison et le jardin) ---
  const sensors = useMemo(() => {
    return [
      { id: 'window_s', label: 'Fenêtres Sud (Salon)', x: 0, y: 1.5, z: houseDepth / 2 },
      { id: 'terrace', label: 'Terrasse Extérieure', x: 0, y: 0.1, z: houseDepth / 2 + 2 },
      { id: 'garden_east', label: 'Jardin Est', x: houseWidth / 2 + 3, y: 0.1, z: 0 },
      { id: 'pool', label: 'Piscine / Patio', x: -houseWidth / 2 - 3, y: 0.1, z: houseDepth / 2 + 1 },
      { id: 'window_e', label: 'Chambre (Est)', x: houseWidth / 2, y: 4.0, z: 0 }
    ];
  }, [houseWidth, houseDepth]);

  // Position du voisin calculée en coordonnées cartésiennes (X, Z) sur la scène
  const neighborPos = useMemo(() => {
    const rad = (neighborAngle * Math.PI) / 180;
    return {
      x: neighborDistance * Math.sin(rad),
      z: neighborDistance * Math.cos(rad)
    };
  }, [neighborDistance, neighborAngle]);

  // --- CALCUL D'IMPACT EN DIRECT ---
  // Calcule pour un mois donné, le nombre d'heures d'ensoleillement reçues avec et sans le voisin
  const calculateLossData = useMemo(() => {
    const data = [];
    let totalInitialHours = 0;
    let totalResidualHours = 0;

    for (let m = 0; m < 12; m++) {
      let activeInitial = 0;
      let activeResidual = 0;
      
      // On teste de 06h à 22h, par intervalles de 15 minutes (0.25h)
      for (let h = 6.0; h <= 22.0; h += 0.25) {
        const { azimuth, altitude } = getSolarPosition(m, h);
        
        // Si le soleil est au-dessus de l'horizon
        if (altitude > 0) {
          // 1. Calcul du vecteur directionnel de la lumière vers le soleil
          const azRad = (azimuth * Math.PI) / 180;
          const altRad = (altitude * Math.PI) / 180;
          
          const R = Math.cos(altRad);
          const sunVector = {
            x: R * Math.sin(azRad),
            y: Math.sin(altRad),
            z: -R * Math.cos(azRad)
          };
          
          // 2. On fait la moyenne de l'ensoleillement sur tous nos capteurs
          sensors.forEach(sensor => {
            activeInitial += 0.25; // Le point reçoit le soleil théoriquement
            
            // Calcul d'ombrage
            const boxCenter = { x: neighborPos.x, y: neighborHeight / 2, z: neighborPos.z };
            const boxHalfExtents = { x: neighborWidth / 2, y: neighborHeight / 2, z: neighborDepth / 2 };
            const rotY = (neighborRotation * Math.PI) / 180;
            
            const isBlocked = checkRayBoxIntersection(sensor, sunVector, boxCenter, rotY, boxHalfExtents);
            
            if (!isBlocked) {
              activeResidual += 0.25; // Pas d'obstacle, le soleil passe !
            }
          });
        }
      }

      const avgInitial = Math.round((activeInitial / sensors.length) * 10) / 10;
      const avgResidual = Math.round((activeResidual / sensors.length) * 10) / 10;
      const avgLoss = Math.round((avgInitial - avgResidual) * 10) / 10;
      const lossPercentage = avgInitial > 0 ? Math.round((avgLoss / avgInitial) * 100) : 0;

      data.push({
        monthName: months[m].substring(0, 4) + '.',
        initial: avgInitial,
        residual: avgResidual,
        loss: avgLoss,
        percent: lossPercentage
      });

      if (m === monthIndex) {
        totalInitialHours = avgInitial;
        totalResidualHours = avgResidual;
      }
    }

    // Calcul global sur l'année
    const annualInitial = data.reduce((acc, d) => acc + d.initial, 0);
    const annualResidual = data.reduce((acc, d) => acc + d.residual, 0);
    const annualLossPercentage = annualInitial > 0 ? Math.round(((annualInitial - annualResidual) / annualInitial) * 100) : 0;

    return {
      monthlyData: data,
      currentMonthInitial: totalInitialHours,
      currentMonthResidual: totalResidualHours,
      currentMonthLoss: Math.max(0, Math.round((totalInitialHours - totalResidualHours) * 10) / 10),
      currentMonthLossPercent: totalInitialHours > 0 ? Math.round(((totalInitialHours - totalResidualHours) / totalInitialHours) * 100) : 0,
      annualLossPercent: annualLossPercentage
    };
  }, [houseWidth, houseHeight, houseDepth, neighborHeight, neighborWidth, neighborDepth, neighborPos, neighborRotation, monthIndex]);

  // --- SCÈNE THREE.JS ---
  useEffect(() => {
    if (!canvasRef.current) return;

    // 1. Initialisation de la Scène, Caméra et Renderer
    const width = canvasRef.current.clientWidth;
    const height = canvasRef.current.clientHeight;
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0d1b2a');
    scene.fog = new THREE.FogExp2('#0d1b2a', 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // 2. Gestion de la Caméra Orbitale Customisée (Sans dépendance)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let theta = Math.PI / 4; // Angle horizontal
    let phi = Math.PI / 3;   // Angle vertical
    let radius = 42;         // Distance de la caméra

    const updateCamera = () => {
      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi);
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 1.5, 0);
    };
    updateCamera();

    const onMouseDown = () => { isDragging = true; };
    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;
      
      theta -= deltaX * 0.005;
      phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, phi - deltaY * 0.005));
      
      updateCamera();
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };
    const onMouseUp = () => { isDragging = false; };
    
    const canvasElement = canvasRef.current;
    canvasElement.addEventListener('mousedown', onMouseDown);
    canvasElement.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Enregistrement des positions initiales lors du clic
    const onMouseDownStore = (e) => {
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };
    canvasElement.addEventListener('mousedown', onMouseDownStore);

    // Support tactile pour mobile
    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const onTouchMove = (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.y;
      
      theta -= deltaX * 0.006;
      phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, phi - deltaY * 0.006));
      
      updateCamera();
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    canvasElement.addEventListener('touchstart', onTouchStart);
    canvasElement.addEventListener('touchmove', onTouchMove, { passive: true });
    canvasElement.addEventListener('touchend', onMouseUp);

    // 3. Construction du Terrain & Environnement
    // Grid Helper pour dessiner les parcelles foncières
    const gridHelper = new THREE.GridHelper(30, 30, '#79a081', '#1b263b');
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Sol Vert (Pelouse/Jardin)
    const groundGeom = new THREE.PlaneGeometry(50, 50);
    const groundMat = new THREE.MeshStandardMaterial({ color: '#1b3a24', roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // 4. Modélisation de la Maison Principale (Centrée à 0, 0)
    const houseGroup = new THREE.Group();
    
    // Murs de la maison
    const bodyGeom = new THREE.BoxGeometry(houseWidth, houseHeight, houseDepth);
    const bodyMat = new THREE.MeshStandardMaterial({ color: '#ebdbcd', roughness: 0.5 }); // Kraft beige
    const houseBody = new THREE.Mesh(bodyGeom, bodyMat);
    houseBody.position.y = houseHeight / 2;
    houseBody.castShadow = true;
    houseBody.receiveShadow = true;
    houseGroup.add(houseBody);

    // Toiture terrasse plate végétalisée (Extrêmement moderne et réactive aux dimensions)
    const roofHeight = 0.4;
    const roofGeom = new THREE.BoxGeometry(houseWidth + 0.3, roofHeight, houseDepth + 0.3);
    const roofMat = new THREE.MeshStandardMaterial({ color: '#588157', roughness: 0.8 }); // Vert mousse/pelouse
    const houseRoof = new THREE.Mesh(roofGeom, roofMat);
    houseRoof.position.y = houseHeight + roofHeight / 2;
    houseRoof.castShadow = true;
    houseRoof.receiveShadow = true;
    houseGroup.add(houseRoof);

    // Grande Baie Vitrée Sud (Verre cyan translucide)
    const windowGeom = new THREE.BoxGeometry(houseWidth - 3, houseHeight * 0.5, 0.25);
    const windowMat = new THREE.MeshStandardMaterial({ 
      color: '#00f5ff', 
      emissive: '#005f73', 
      roughness: 0.1, 
      metalness: 0.9, 
      transparent: true, 
      opacity: 0.6 
    });
    const glassWindow = new THREE.Mesh(windowGeom, windowMat);
    glassWindow.position.set(0, houseHeight * 0.35, houseDepth / 2 + 0.05);
    houseGroup.add(glassWindow);

    // Terrasse en bois Sud
    const terraceGeom = new THREE.BoxGeometry(houseWidth + 1, 0.15, 4);
    const terraceMat = new THREE.MeshStandardMaterial({ color: '#d6b99f', roughness: 0.7 }); // Kraft clair
    const terrace = new THREE.Mesh(terraceGeom, terraceMat);
    terrace.position.set(0, 0.08, houseDepth / 2 + 2);
    terrace.receiveShadow = true;
    houseGroup.add(terrace);

    // Piscine / Patio bleu
    const poolGeom = new THREE.BoxGeometry(3, 0.1, 4);
    const poolMat = new THREE.MeshStandardMaterial({ color: '#00a8e8', roughness: 0.2, metalness: 0.8 });
    const pool = new THREE.Mesh(poolGeom, poolMat);
    pool.position.set(-houseWidth / 2 - 3, 0.05, houseDepth / 2 + 1);
    pool.receiveShadow = true;
    houseGroup.add(pool);

    scene.add(houseGroup);

    // 5. Modélisation de la Construction Voisine (La menace)
    const neighborGroup = new THREE.Group();
    
    // Volume opaque / fil de fer du voisin
    const neighborGeom = new THREE.BoxGeometry(neighborWidth, neighborHeight, neighborDepth);
    // Matériau semi-translucide rouge/kraft pour indiquer la simulation d'intrusion d'ombre
    const neighborMat = new THREE.MeshStandardMaterial({ 
      color: '#3c3c3c', 
      transparent: true, 
      opacity: 0.5,
      roughness: 0.7 
    });
    const neighborBody = new THREE.Mesh(neighborGeom, neighborMat);
    neighborBody.position.y = neighborHeight / 2;
    neighborBody.castShadow = true;
    neighborBody.receiveShadow = true;
    neighborGroup.add(neighborBody);

    // Contours fil de fer orange pour styliser le projet
    const edgeGeom = new THREE.EdgesGeometry(neighborGeom);
    const edgeMat = new THREE.LineBasicMaterial({ color: '#ff7b00', linewidth: 2 });
    const wireframe = new THREE.LineSegments(edgeGeom, edgeMat);
    wireframe.position.y = neighborHeight / 2;
    neighborGroup.add(wireframe);

    scene.add(neighborGroup);

    // 6. Placement visuel des Capteurs (Sphères lumineuses dorées)
    const sensorSpheres = [];
    const sensorGeom = new THREE.SphereGeometry(0.25, 16, 16);
    
    sensors.forEach((s) => {
      const sMat = new THREE.MeshBasicMaterial({ color: '#ffb703' });
      const sphere = new THREE.Mesh(sensorGeom, sMat);
      sphere.position.set(s.x, s.y, s.z);
      scene.add(sphere);
      sensorSpheres.push({ id: s.id, mesh: sphere });
    });

    // 7. Éléments d'Ambiance & Boussole 3D au sol
    // Flèche du Nord
    const compassGroup = new THREE.Group();
    compassGroup.position.set(0, 0.02, 0);
    const arrowGeom = new THREE.ConeGeometry(0.5, 2, 4);
    const arrowMat = new THREE.MeshBasicMaterial({ color: '#ef4444' });
    const compassArrow = new THREE.Mesh(arrowGeom, arrowMat);
    compassArrow.rotation.x = Math.PI / 2;
    compassArrow.position.z = -13; // Positionné vers le Nord
    compassGroup.add(compassArrow);
    
    // Lettre "N" au Nord
    const compassLinesGeom = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      -0.3, 0, -14.5,   -0.3, 0, -15.1,
      -0.3, 0, -14.5,    0.3, 0, -15.1,
       0.3, 0, -14.5,    0.3, 0, -15.1
    ]);
    compassLinesGeom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const compLineMat = new THREE.LineBasicMaterial({ color: '#ffffff' });
    const compassN = new THREE.LineSegments(compassLinesGeom, compLineMat);
    compassGroup.add(compassN);
    scene.add(compassGroup);

    // 8. Configuration d'Éclairage (Le Soleil & Ambiance céleste)
    const ambientLight = new THREE.AmbientLight('#1b263b', 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight('#fffae0', 1.5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.bias = -0.0008;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 40;
    sunLight.shadow.camera.left = -16;
    sunLight.shadow.camera.right = 16;
    sunLight.shadow.camera.top = 16;
    sunLight.shadow.camera.bottom = -16;
    scene.add(sunLight);

    // Hémisphère d'éclairage pour un rendu naturel
    const hemiLight = new THREE.HemisphereLight('#8ecae6', '#1b4a24', 0.25);
    scene.add(hemiLight);

    // 9. Boucle d'Animation et de Rendu du Canvas
    let animationFrameId;
    
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      // A. Mise à jour de la position du Voisin
      neighborGroup.position.set(neighborPos.x, 0, neighborPos.z);
      neighborGroup.rotation.y = (neighborRotation * Math.PI) / 180;
      
      // B. Calcul trigonométrique exact de la position du Soleil
      const { azimuth, altitude } = getSolarPosition(monthIndex, hour);
      
      if (altitude > 0) {
        // Le soleil brille !
        const azRad = (azimuth * Math.PI) / 180;
        const altRad = (altitude * Math.PI) / 180;
        
        const R = 22; // Distance de positionnement de la source lumineuse
        sunLight.position.x = R * Math.sin(azRad);
        sunLight.position.y = R * Math.sin(altRad);
        sunLight.position.z = -R * Math.cos(azRad);
        sunLight.visible = true;
        sunLight.intensity = Math.min(1.8, Math.max(0.5, altitude / 15));
        hemiLight.intensity = 0.3;
        scene.background.set('#0d1b2a');
      } else {
        // C'est la nuit virtuelle
        sunLight.visible = false;
        hemiLight.intensity = 0.05;
        scene.background.set('#030712'); // Fond bleu nuit foncé
      }

      // C. Raycasting local pour allumer/éteindre la lumière des capteurs 3D
      if (altitude > 0) {
        const azRad = (azimuth * Math.PI) / 180;
        const altRad = (altitude * Math.PI) / 180;
        const R = Math.cos(altRad);
        const sunVector = {
          x: R * Math.sin(azRad),
          y: Math.sin(altRad),
          z: -R * Math.cos(azRad)
        };

        sensorSpheres.forEach(sSphere => {
          const s = sensors.find(item => item.id === sSphere.id);
          const boxCenter = { x: neighborPos.x, y: neighborHeight / 2, z: neighborPos.z };
          const boxHalfExtents = { x: neighborWidth / 2, y: neighborHeight / 2, z: neighborDepth / 2 };
          const rotY = (neighborRotation * Math.PI) / 180;
          
          const isBlocked = checkRayBoxIntersection(s, sunVector, boxCenter, rotY, boxHalfExtents);
          
          if (isBlocked) {
            sSphere.mesh.material.color.set('#3c3c3c'); // Éteint / Ombre
          } else {
            sSphere.mesh.material.color.set('#ffc300'); // Allumé / Plein soleil
          }
        });
      } else {
        sensorSpheres.forEach(sSphere => {
          sSphere.mesh.material.color.set('#1e293b'); // Couleur nuit
        });
      }

      renderer.render(scene, camera);
    };
    
    animate();

    // 10. Gestion du redimensionnement de l'écran
    const handleResize = () => {
      if (!canvasRef.current) return;
      const w = canvasRef.current.clientWidth;
      const h = canvasRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Nettoyage de la mémoire WebGL à la destruction du composant
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvasElement.removeEventListener('mousedown', onMouseDown);
      canvasElement.removeEventListener('mousemove', onMouseMove);
      canvasElement.removeEventListener('mousedown', onMouseDownStore);
      window.removeEventListener('mouseup', onMouseUp);
      canvasElement.removeEventListener('touchstart', onTouchStart);
      canvasElement.removeEventListener('touchmove', onTouchMove);
      canvasElement.removeEventListener('touchend', onMouseUp);
      
      gridHelper.geometry.dispose();
      gridHelper.material.dispose();
      groundGeom.dispose();
      groundMat.dispose();
      bodyGeom.dispose();
      bodyMat.dispose();
      roofGeom.dispose();
      roofMat.dispose();
      windowGeom.dispose();
      windowMat.dispose();
      terraceGeom.dispose();
      terraceMat.dispose();
      poolGeom.dispose();
      poolMat.dispose();
      neighborGeom.dispose();
      neighborMat.dispose();
      edgeGeom.dispose();
      edgeMat.dispose();
      sensorGeom.dispose();
      arrowGeom.dispose();
      arrowMat.dispose();
      compassLinesGeom.dispose();
      compLineMat.dispose();
      
      renderer.dispose();
    };
  }, [houseWidth, houseHeight, houseDepth, neighborHeight, neighborWidth, neighborDepth, neighborPos, neighborRotation, monthIndex, hour, sensors]);

  // --- ANIMATION HORAIRE JOURNALIÈRE ---
  useEffect(() => {
    let intervalId;
    if (isPlaying) {
      intervalId = setInterval(() => {
        setHour((prevHour) => {
          const nextHour = prevHour + 0.25;
          return nextHour > 20 ? 8 : nextHour; // Boucle de 08h à 20h
        });
      }, 80); // Vitesse de rotation rapide
    }
    return () => clearInterval(intervalId);
  }, [isPlaying]);

  // --- PASTILLES ET STATUTS DE PRÉJUDICE ---
  const currentMonthLossPercent = calculateLossData.currentMonthLossPercent;
  const annualLossPercent = calculateLossData.annualLossPercent;

  const impactStatus = useMemo(() => {
    if (annualLossPercent <= 10) {
      return { class: styles.statusFavorable, label: t('sun.loss_levels.favorable') || "Favorable (Perte minime)", color: '#10b981' };
    } else if (annualLossPercent <= 25) {
      return { class: styles.statusModerate, label: t('sun.loss_levels.moderate') || "Modéré (Perte tolérable)", color: '#f59e0b' };
    } else if (annualLossPercent <= 50) {
      return { class: styles.statusCritical, label: t('sun.loss_levels.critical') || "Critique (Perte majeure)", color: '#ef4444' };
    } else {
      return { class: styles.statusIntolerable, label: t('sun.loss_levels.intolerable') || "Intolérable (Trouble anormal)", color: '#8b5cf6' };
    }
  }, [annualLossPercent, t]);

  // --- CAPTURE DE LEADS SUPABASE ---
  const handleSubmitLead = async (e) => {
    e.preventDefault();
    if (!clientName || !clientEmail || !clientAddress) {
      setLeadError("Veuillez renseigner votre nom, votre adresse et votre email.");
      return;
    }

    setSubmittingLead(true);
    setLeadError('');

    try {
      const descriptionProjetVoisin = `Hauteur: ${neighborHeight}m, Distance: ${neighborDistance}m, Perte ensoleillement moyenne annuelle: ${annualLossPercent}%`;
      const messageBrut = `Adresse du litige: ${clientAddress}. \n${clientMessage || "Pas de message supplémentaire."}`;

      const { error } = await supabase
        .from('simulations')
        .insert([{
          address: clientAddress,
          parcel_ref: `Simulation Ensoleillement - Urbateam`,
          total_surface: `Perte globale : ${annualLossPercent}%`,
          lot_a_surface: descriptionProjetVoisin,
          lot_b_surface: `Statut impact: ${impactStatus.label}`,
          client_name: clientName,
          client_email: clientEmail,
          client_phone: clientPhone || null,
          client_message: messageBrut
        }]);

      if (error) throw new Error(error.message);

      setLeadSuccess(true);
      setClientName('');
      setClientEmail('');
      setClientPhone('');
      setClientMessage('');
    } catch (err) {
      console.error('Erreur Supabase lead ensoleillement :', err);
      setLeadError("Une erreur technique est survenue lors de l'enregistrement de votre étude. Veuillez réessayer.");
    } finally {
      setSubmittingLead(false);
    }
  };

  // --- GÉNÉRATEUR DE RAPPORT PDF JSPD ---
  const generatePdfReport = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Fond beige chaud (Warm white de la charte)
    doc.setFillColor(251, 248, 247);
    doc.rect(0, 0, 210, 297, 'F');

    // --- EN-TÊTE URBATEAM ---
    doc.setFillColor(121, 160, 129); // Vert primaire
    doc.rect(0, 0, 210, 32, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.text("URBAteam", 15, 18);
    doc.setFontSize(9);
    doc.setFont("Helvetica", "normal");
    doc.text("CABINET DE GÉOMÈTRES-EXPERTS ET URBANISTES", 15, 24);

    doc.setFontSize(8);
    doc.text("Brest - Saint-Renan - Douarnenez", 155, 15);
    doc.text("Tél: 02 98 84 29 65", 155, 20);
    doc.text("contact@urbateam.fr", 155, 25);

    // --- TITRE DU DOCUMENT ---
    doc.setTextColor(121, 160, 129);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    doc.text("RAPPORT D'IMPACT D'ENSOLEILLEMENT", 15, 48);
    doc.setFontSize(10);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text("Simulation 3D et calcul géométrique de perte d'ombre en voisinage", 15, 54);

    // Ligne décorative Kraft
    doc.setDrawColor(214, 185, 159);
    doc.setLineWidth(0.8);
    doc.line(15, 58, 195, 58);

    // --- INFORMATIONS DU DEMANDEUR ---
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(121, 160, 129);
    doc.setLineWidth(0.15);
    doc.rect(15, 65, 180, 25, 'FD');

    doc.setTextColor(121, 160, 129);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.text("PROPRIÉTÉ ÉTUDIÉE & DEMANDEUR", 20, 71);

    doc.setTextColor(60, 60, 60);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text(`Adresse du litige : ${clientAddress || "Non spécifiée (simulation en ligne)"}`, 20, 78);
    doc.text(`Date de calcul : ${new Date().toLocaleDateString('fr-FR')} - Latitude: ${LATITUDE_FINISTERE}° N (Brest)`, 20, 84);

    // --- CONFIGURATION DE LA SIMULATION ---
    doc.setTextColor(121, 160, 129);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.text("1. Paramètres du Projet Voisin (Modélisé en 3D)", 15, 102);

    doc.setTextColor(60, 60, 60);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text(`- Hauteur totale de la construction : ${neighborHeight} mètres`, 20, 110);
    doc.text(`- Largeur de la façade : ${neighborWidth} mètres`, 20, 116);
    doc.text(`- Profondeur du bâtiment : ${neighborDepth} mètres`, 20, 122);
    doc.text(`- Distance de retrait par rapport aux fenêtres : ${neighborDistance} mètres`, 20, 128);
    doc.text(`- Orientation du projet voisin : Angle de ${neighborAngle}° (Secteur ${neighborAngle > 90 && neighborAngle < 270 ? 'NORD' : 'SUD'})`, 20, 134);

    // --- DISOC'HOÙ AR JEDADUR / RÉSULTATS ---
    doc.setTextColor(121, 160, 129);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.text("2. Analyse géométrique des pertes de lumière", 15, 148);

    doc.setFillColor(255, 255, 255);
    doc.rect(15, 153, 180, 38, 'FD');

    // Statut en couleur
    doc.setFillColor(impactStatus.color);
    doc.rect(20, 159, 170, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`IMPACT CONSTATÉ : ${impactStatus.label.toUpperCase()}`, 25, 164.5);

    doc.setTextColor(60, 60, 60);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`- Pourcentage annuel d'heures d'ensoleillement perdues : ${annualLossPercent}%`, 25, 175);
    doc.text(`- Perte maximale observée en ${months[monthIndex]} : ${calculateLossData.currentMonthLoss}h par jour (-${currentMonthLossPercent}%)`, 25, 182);
    doc.text(`- Capteurs affectés : Salon (Sud), Fenêtres Est, Terrasse et Zone Jardin`, 25, 187);

    // --- HISTORIQUE MENSUEL TABLEAU ---
    doc.setTextColor(121, 160, 129);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.text("3. Tableau mensuel comparatif de l'ensoleillement (heures/jour)", 15, 199);

    let currentY = 205;
    // En-tête de tableau
    doc.setFillColor(60, 60, 60);
    doc.rect(15, currentY, 180, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("Mois", 20, currentY + 4.5);
    doc.text("Soleil Initial (h)", 60, currentY + 4.5);
    doc.text("Soleil avec Voisin (h)", 105, currentY + 4.5);
    doc.text("Perte nette (h)", 150, currentY + 4.5);
    doc.text("Perte (%)", 178, currentY + 4.5);

    // Lignes de tableau
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    calculateLossData.monthlyData.forEach((row, idx) => {
      currentY += 6;
      if (idx % 2 === 0) {
        doc.setFillColor(235, 235, 235);
        doc.rect(15, currentY, 180, 6, 'F');
      }
      doc.text(months[idx], 20, currentY + 4.5);
      doc.text(`${row.initial}h`, 65, currentY + 4.5);
      doc.text(`${row.residual}h`, 110, currentY + 4.5);
      doc.text(`${row.loss}h`, 155, currentY + 4.5);
      doc.text(`${row.percent}%`, 180, currentY + 4.5);
    });

    // PAGE 2 (Cadre Juridique et Actions)
    doc.addPage();
    doc.setFillColor(251, 248, 247);
    doc.rect(0, 0, 210, 297, 'F');

    // Bandeau d'en-tête léger
    doc.setFillColor(121, 160, 129);
    doc.rect(0, 0, 210, 15, 'F');

    doc.setTextColor(121, 160, 129);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text("CADRE JURIDIQUE ET RECOMMANDATIONS D'EXPERT", 15, 30);

    doc.setDrawColor(214, 185, 159);
    doc.setLineWidth(0.5);
    doc.line(15, 34, 195, 34);

    doc.setTextColor(60, 60, 60);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Le trouble anormal de voisinage par perte d'ensoleillement :", 15, 43);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9.5);
    const p1 = "En France, nul ne peut causer à autrui un trouble anormal de voisinage. Une perte d'ensoleillement significative engendrée par l'édification d'une nouvelle construction (immeuble, maison, surélévation, hangar) peut être sanctionnée par les tribunaux civils, même si le projet dispose d'un permis de construire parfaitement valide.";
    doc.text(doc.splitTextToSize(p1, 180), 15, 49);

    const p2 = "Les critères pris en compte par la jurisprudence incluent : la situation géographique (secteur urbain dense ou zone rurale), l'exposition des pièces de vie principales (baies vitrées de salon, chambres) par rapport aux dépendances (garages, celliers), et la hauteur relative de la nouvelle construction.";
    doc.text(doc.splitTextToSize(p2, 180), 15, 65);

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Vos étapes de recours conseillées par Urbateam :", 15, 83);

    doc.setFont("Helvetica", "normal");
    doc.text("1. L'étude d'ensoleillement préalable (faite en ligne) :", 15, 90);
    const s1 = "Elle vous permet d'objectiver la situation avec des données chiffrées exactes. Votre perte annuelle globale estimée est de " + annualLossPercent + "%, ce qui représente un préjudice mesurable.";
    doc.text(doc.splitTextToSize(s1, 175), 20, 95);

    doc.text("2. Le Constat d'Huissier & Le Rapport du Géomètre-Expert :", 15, 107);
    const s2 = "C'est l'étape indispensable avant toute procédure judiciaire. Nos experts viennent mesurer précisément le terrain au scanner laser 3D pour produire un rapport topographique d'ensoleillement officiel et certifié.";
    doc.text(doc.splitTextToSize(s2, 175), 20, 112);

    doc.text("3. La tentative de conciliation amiable :", 15, 124);
    const s3 = "Muni de votre rapport officiel Urbateam, vous pouvez rencontrer votre voisin ou le promoteur immobilier pour négocier des ajustements (recul du bâtiment de 2 mètres, abaissement du faîtage de la toiture, etc.).";
    doc.text(doc.splitTextToSize(s3, 175), 20, 129);

    doc.text("4. L'action en justice devant le Tribunal Judiciaire :", 15, 141);
    const s4 = "Si aucun accord n'est trouvé, vous pouvez saisir le tribunal compétent pour demander des dommages et intérêts pour dépréciation foncière de votre bien ou réclamer la démolition/modification de l'ouvrage.";
    doc.text(doc.splitTextToSize(s4, 175), 20, 146);

    // Encadré de signature et de contact direct
    doc.setFillColor(235, 244, 237); // Vert très clair
    doc.setDrawColor(121, 160, 129);
    doc.setLineWidth(0.4);
    doc.rect(15, 165, 180, 48, 'FD');

    doc.setTextColor(121, 160, 129);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.text("ENTREZ EN CONTACT AVEC NOTRE CABINET GÉOMÈTRE", 20, 172);

    doc.setTextColor(60, 60, 60);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text("Pour faire valider légalement ces calculs et disposer d'un rapport opposable en justice :", 20, 179);
    doc.text("- Demandez une intervention de nos techniciens fonciers à Brest et dans tout le Finistère.", 20, 185);
    doc.text("- Nous réalisons des levés laser 3D au millimètre et des rapports d'ensoleillement certifiés.", 20, 191);
    doc.setFont("Helvetica", "bold");
    doc.text("Appelez notre standard au 02 98 84 29 65 ou écrivez à contact@urbateam.fr", 20, 198);

    // Footer de page
    doc.setTextColor(150, 150, 150);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text("Document généré automatiquement à titre d'estimation préliminaire. Seul le relevé sur le terrain par un Géomètre-Expert certifie les calculs.", 15, 280);

    doc.save(`Rapport_Impact_Ensoleillement_Urbateam.pdf`);
  };

  // --- RENDU COMPOSANT ---
  return (
    <div className="container py-section">
      <PageHeader 
        title={t('sun.title') || "Calcul d'Ombre Portée & d'Ensoleillement"} 
        subtitle={t('sun.subtitle') || "Simulez virtuellement en 3D la trajectoire solaire et visualisez en direct les ombres projetées d'un voisin sur vos fenêtres et votre jardin."} 
      />

      <div className={styles.layout}>
        {/* Panel 3D et Canvas (Zone Interactive Principale) */}
        <div className={styles.canvasPanel}>
          <div className={styles.canvasContainer}>
            <canvas ref={canvasRef} className={styles.canvas} />
            
            {/* Boussole 3D en haut à droite */}
            <div className={styles.overlayCompass}>N</div>

            {/* Informations temporelles sur le soleil */}
            <div className={styles.overlayTime}>
              {months[monthIndex]} - {Math.floor(hour)}h{String(Math.round((hour % 1) * 60)).padStart(2, '0')}
              <span>Latitude: {LATITUDE_FINISTERE}° N (Brest)</span>
            </div>

            {/* Boutons de contrôle de lecture journalière */}
            <div className={styles.overlayControls}>
              <button 
                onClick={() => setIsPlaying(!isPlaying)} 
                className={styles.overlayBtn}
                title={isPlaying ? "Mettre en pause" : "Lancer le cycle solaire"}
              >
                {isPlaying ? <Moon size={16} /> : <Sun size={16} />}
              </button>
            </div>
          </div>

          {/* Solar Timeline under 3D Canvas */}
          <GlassCard className={styles.timelineCard}>
            <div className={styles.timelineFlex}>
              {/* Play/Pause Button */}
              <button 
                onClick={() => setIsPlaying(!isPlaying)} 
                className={styles.playBtn}
                title={isPlaying ? "Mettre en pause" : "Lancer le cycle solaire"}
              >
                {isPlaying ? <Moon size={16} /> : <Sun size={16} />}
                <span>{isPlaying ? "Pause" : "Simuler la journée"}</span>
              </button>

              {/* Month Slider */}
              <div className={styles.timelineGroup}>
                <label className={styles.timelineLabel}>
                  <Calendar size={14} />
                  <span>Période : <strong>{months[monthIndex]}</strong></span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="11"
                  value={monthIndex}
                  onChange={(e) => setMonthIndex(parseInt(e.target.value))}
                  className={styles.timelineSlider}
                />
              </div>

              {/* Hour Slider */}
              <div className={styles.timelineGroup}>
                <label className={styles.timelineLabel}>
                  <Clock size={14} />
                  <span>Heure : <strong>{Math.floor(hour)}h{String(Math.round((hour % 1) * 60)).padStart(2, '0')}</strong></span>
                </label>
                <input
                  type="range"
                  min="8"
                  max="20"
                  step="0.25"
                  value={hour}
                  disabled={isPlaying}
                  onChange={(e) => setHour(parseFloat(e.target.value))}
                  className={styles.timelineSlider}
                />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Sidebar des curseurs de réglages 3D (Reste aligné à côté du canvas) */}
        <div className={styles.sidebar}>
          <GlassCard className={styles.ficheCard}>
            {/* Custom Sidebar Tab Switcher */}
            <div className={styles.sidebarTabRow}>
              <button 
                onClick={() => setActiveTab('voisin')}
                className={`${styles.sidebarTab} ${activeTab === 'voisin' ? styles.sidebarTabActive : ''}`}
                type="button"
              >
                <Ruler size={16} color="var(--primary-color)" />
                <span>{t('sun.neighbor_settings') || "Projet Voisin"}</span>
              </button>
              <button 
                onClick={() => setActiveTab('propriete')}
                className={`${styles.sidebarTab} ${activeTab === 'propriete' ? styles.sidebarTabActive : ''}`}
                type="button"
              >
                <Home size={16} color="var(--accent-color)" />
                <span>{t('sun.house_settings') || "Votre Propriété"}</span>
              </button>
            </div>

            {/* Condition: Votre Propriété */}
            {activeTab === 'propriete' && (
              <div>
                <h4 className={styles.simTitle} style={{ borderBottom: 'none', marginBottom: '0.8rem', paddingBottom: 0 }}>
                  <Home size={18} color="var(--accent-color)" />
                  {t('sun.house_settings') || "Votre Propriété"}
                </h4>

                {/* Curseurs de la maison */}
                <div className={styles.controlGroup}>
                  <label className={styles.controlLabel}>
                    <span>Largeur de façade</span>
                    <span className={styles.controlVal}>{houseWidth} m</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="25"
                    value={houseWidth}
                    onChange={(e) => setHouseWidth(parseInt(e.target.value))}
                    className={styles.sliderInput}
                  />
                </div>

                <div className={styles.controlGroup}>
                  <label className={styles.controlLabel}>
                    <span>Hauteur faîtage</span>
                    <span className={styles.controlVal}>{houseHeight} m</span>
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="18"
                    value={houseHeight}
                    onChange={(e) => setHouseHeight(parseInt(e.target.value))}
                    className={styles.sliderInput}
                  />
                </div>
              </div>
            )}

            {/* Condition: Projet Voisin */}
            {activeTab === 'voisin' && (
              <div>
                <h4 className={styles.simTitle} style={{ borderBottom: 'none', marginBottom: '0.8rem', paddingBottom: 0 }}>
                  <Ruler size={18} color="var(--primary-color)" />
                  {t('sun.neighbor_settings') || "Projet de Construction Voisin"}
                </h4>

                {/* Curseurs du voisin */}
                <div className={styles.controlGroup}>
                  <label className={styles.controlLabel}>
                    <span>Hauteur du bâtiment</span>
                    <span className={styles.controlVal}>{neighborHeight} m</span>
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="16"
                    value={neighborHeight}
                    onChange={(e) => setNeighborHeight(parseInt(e.target.value))}
                    className={styles.sliderInput}
                  />
                </div>

                <div className={styles.controlGroup}>
                  <label className={styles.controlLabel}>
                    <span>Distance de votre maison</span>
                    <span className={styles.controlVal}>{neighborDistance} m</span>
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="30"
                    value={neighborDistance}
                    onChange={(e) => setNeighborDistance(parseInt(e.target.value))}
                    className={styles.sliderInput}
                  />
                </div>

                <div className={styles.controlGroup}>
                  <label className={styles.controlLabel}>
                    <span>Angle d'implantation</span>
                    <span className={styles.controlVal}>{neighborAngle}°</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={neighborAngle}
                    onChange={(e) => setNeighborAngle(parseInt(e.target.value))}
                    className={styles.sliderInput}
                  />
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* ZONE INFÉRIEURE : ANALYSE DES DISOC'HOÙ & ACTIONS (Agencée en 3 Colonnes équilibrées) */}
      <div className={styles.bottomSection}>
        
        {/* Colonne 1 : Résultats analytiques de perte globale & Graphique mensuel */}
        <div className={styles.bottomCol}>
          <GlassCard className={styles.ficheCard}>
            <h4 className={styles.simTitle}>
              <FileText size={18} color="var(--primary-color)" />
              {t('sun.results') || "Résultats des calculs"}
            </h4>

            <div className={styles.resultsSummary}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', justifyContent: 'center' }}>
                {/* Cercle indicateur de perte globale */}
                <div className={styles.percentageCircle}>
                  <svg width="130" height="130">
                    <circle cx="65" cy="65" r="56" stroke="rgba(121, 160, 129, 0.15)" strokeWidth="8" fill="transparent" />
                    <circle 
                      cx="65" 
                      cy="65" 
                      r="56" 
                      stroke={impactStatus.color} 
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray={2 * Math.PI * 56}
                      strokeDashoffset={2 * Math.PI * 56 * (1 - annualLossPercent / 100)}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 0.5s ease', transform: 'rotate(-90deg)', transformOrigin: '65px 65px' }}
                    />
                  </svg>
                  <div className={styles.percentageLabel}>
                    <span className={styles.percentageNum}>-{annualLossPercent}%</span>
                    <span className={styles.percentageTxt}>{t('sun.loss_label') || "Global"}</span>
                  </div>
                </div>

                {/* Badge & détails condensés */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1 }}>
                  <div className={`${styles.statusBadge} ${impactStatus.class}`} style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}>
                    {impactStatus.label}
                  </div>
                  <div className={styles.checklist} style={{ marginTop: 0 }}>
                    <div className={`${styles.checkItem} ${calculateLossData.currentMonthLossPercent > 20 ? styles.checkItemCrit : styles.checkItemValid}`} style={{ padding: '0.5rem 0.8rem' }}>
                      {calculateLossData.currentMonthLossPercent > 20 ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
                      <span style={{ fontSize: '0.78rem' }}>
                        Perte max de <strong>{calculateLossData.currentMonthLoss}h/j</strong> en {months[monthIndex]}.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bouton Génération du Rapport PDF */}
              <button onClick={generatePdfReport} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', marginTop: '0.5rem', borderRadius: '50px', fontSize: '0.85rem' }}>
                <FileText size={16} />
                {t('sun.pdf_report') || "Télécharger le Rapport (PDF)"}
              </button>
            </div>
          </GlassCard>

          {/* Graphique d'impact mensuel comparatif */}
          <div className={styles.chartCard} style={{ marginTop: 0 }}>
            <h4 className={styles.chartTitle} style={{ fontSize: '0.95rem' }}>
              <Sun size={18} color="var(--primary-color)" />
              {t('sun.month_graph') || "Heures moyennes d'ensoleillement par jour"}
            </h4>
            
            <div className={styles.chartContainer} style={{ height: '170px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={calculateLossData.monthlyData}
                  margin={{ top: 5, right: 5, left: -32, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorInitial" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0.01}/>
                    </linearGradient>
                    <linearGradient id="colorResidual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(121, 160, 129, 0.08)"/>
                  <XAxis dataKey="monthName" stroke="var(--text-main)" fontSize={8.5} tickLine={false} />
                  <YAxis stroke="var(--text-main)" fontSize={8.5} tickLine={false} unit="h" domain={[0, 16]} />
                  <Tooltip 
                    contentStyle={{ background: 'var(--glass-bg)', borderColor: 'var(--primary-color)', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Area 
                    name="Initial" 
                    type="monotone" 
                    dataKey="initial" 
                    stroke="var(--primary-color)" 
                    fillOpacity={1} 
                    fill="url(#colorInitial)" 
                    strokeWidth={2}
                  />
                  <Area 
                    name="Avec voisin" 
                    type="monotone" 
                    dataKey="residual" 
                    stroke="var(--accent-color)" 
                    fillOpacity={1} 
                    fill="url(#colorResidual)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Colonne 2 : Formulaire d'Étude de Faisabilité (Lead Capture) */}
        <div className={styles.bottomCol}>
          <GlassCard className={styles.ficheCard} style={{ height: '100%' }}>
            {leadSuccess ? (
              <div className={styles.successCard}>
                <div className={styles.successTitle}>
                  <CheckCircle size={22} />
                  {t('sun.registered_sim') || "Simulation enregistrée !"}
                </div>
                <p className={styles.successText}>
                  {t('sun.registered_sim_desc') || "Votre simulation d'ensoleillement a bien été transmise à notre bureau d'étude foncier. Un Géomètre-Expert Urbateam analysera le préjudice et vous recontactera rapidement."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitLead} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <h4 className={styles.simTitle}>
                  <Mail size={18} color="var(--primary-color)" />
                  {t('sun.free_study') || "Faire valider par un expert"}
                </h4>
                
                <input
                  type="text"
                  placeholder="Adresse de votre propriété *"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  className={styles.formInput}
                  required
                />
                
                <input
                  type="text"
                  placeholder="Votre nom complet *"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className={styles.formInput}
                  required
                />
                
                <input
                  type="email"
                  placeholder="Adresse e-mail *"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className={styles.formInput}
                  required
                />
                
                <input
                  type="tel"
                  placeholder="Téléphone (optionnel)"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className={styles.formInput}
                />
                
                <textarea
                  placeholder="Décrivez en quelques mots le projet du voisin..."
                  value={clientMessage}
                  onChange={(e) => setClientMessage(e.target.value)}
                  className={styles.formTextarea}
                  style={{ flexGrow: 1, minHeight: '90px' }}
                />

                {leadError && (
                  <p style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '0.8rem' }}>{leadError}</p>
                )}

                <button
                  type="submit"
                  disabled={submittingLead}
                  className={styles.submitBtn}
                  style={{ marginTop: 'auto' }}
                >
                  {submittingLead ? <Loader size={16} className="spin" /> : <Mail size={16} />}
                  {t('sun.contact_expert') || "Prendre RDV avec un Expert"}
                </button>
              </form>
            )}
          </GlassCard>
        </div>

        {/* Colonne 3 : Informations Pratiques / Recours FAQ */}
        <div className={styles.bottomCol}>
          <GlassCard className={styles.ficheCard} style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyGap: '1.2rem' }}>
            <div>
              <h4 className={styles.simTitle}>
                <AlertTriangle size={18} color="var(--primary-color)" />
                {t('sun.steps_title') || "☀️ Quels sont les recours en cas de perte d'ensoleillement ? ☀️"}
              </h4>
              <p className={styles.infoDesc} style={{ fontSize: '0.82rem', lineHeight: '1.5', opacity: 0.85 }}>
                {t('sun.steps_desc') || "La perte d'ensoleillement majeure constitue un 'trouble anormal de voisinage'. Un Géomètre-Expert peut réaliser une étude officielle et un constat pour prouver le préjudice devant un tribunal civil."}
              </p>
            </div>

            <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(121, 160, 129, 0.1)', paddingTop: '1.5rem' }}>
              <h4 className={styles.infoTitle} style={{ fontSize: '1.05rem', marginBottom: '0.6rem' }}>
                <Compass size={18} color="var(--accent-color)" />
                {t('sun.viability_title') || "Comment se caractérise le trouble ?"}
              </h4>
              <p className={styles.infoDesc} style={{ fontSize: '0.82rem', lineHeight: '1.5', opacity: 0.85 }}>
                {t('sun.viability_desc') || "Le juge civil évalue souverainement la gravité du préjudice en fonction de la situation géographique (ville dense ou rurale), du coefficient d'ensoleillement initial et de la pièce touchée."}
              </p>
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}
