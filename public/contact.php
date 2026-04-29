<?php
// Script de traitement de formulaire contact pour URBATEAM (Hébergement OVH)
header('Content-Type: text/html; charset=utf-8');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // 1. Récupération et nettoyage des champs
    $nom = strip_tags(trim($_POST["nom"] ?? ''));
    $email = filter_var(trim($_POST["email"] ?? ''), FILTER_SANITIZE_EMAIL);
    $telephone = strip_tags(trim($_POST["telephone"] ?? ''));
    $motif = strip_tags(trim($_POST["motif"] ?? ''));
    $messageText = strip_tags(trim($_POST["message"] ?? ''));
    $captcha = trim($_POST["captcha"] ?? '');

    // 2. Vérification anti-robot
    if ($captcha !== "7") {
        header("Location: /contact.html?error=1");
        exit;
    }

    if (empty($nom) || empty($email) || empty($messageText)) {
        header("Location: /contact.html?error=1");
        exit;
    }

    // 3. Configuration de l'Email
    $recipient = "contact@urbateam.fr";
    $subject = "Site Web URBATEAM : Nouveau dossier de " . $nom . " (" . $motif . ")";

    $boundary = md5("urbateam" . time());
    
    $headers = "From: Site Web Urbateam <nepasrepondre@urbateam.fr>\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n";

    // 4. Construction du corps du mail (Texte)
    $body = "--$boundary\r\n";
    $body .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
    $body .= "NOUVELLE DEMANDE DE CONTACT (RÉALISÉE DEPUIS LE SITE WEB)\n\n";
    $body .= "NOM : $nom\n";
    $body .= "EMAIL : $email\n";
    $body .= "TÉLÉPHONE : $telephone\n";
    $body .= "MOTIF : $motif\n\n";
    $body .= "MESSAGE :\n$messageText\n\n";

    // 5. Traitement des pièces jointes Uploadées
    if (isset($_FILES['attachment']) && count($_FILES['attachment']['name']) > 0) {
        $files = $_FILES['attachment'];
        for ($i = 0; $i < count($files['name']); $i++) {
            if ($files['error'][$i] == UPLOAD_ERR_OK && is_uploaded_file($files['tmp_name'][$i])) {
                $fileTmpName = $files['tmp_name'][$i];
                $fileName = basename($files['name'][$i]);
                $fileSize = $files['size'][$i];
                $fileType = mime_content_type($fileTmpName);

                // Sécurité : Max 10 Mo par fichier
                if ($fileSize > 10485760) {
                    continue;
                }

                // Lecture du fichier et encodage pour l'email
                $fileData = file_get_contents($fileTmpName);
                $fileData = chunk_split(base64_encode($fileData));

                $body .= "--$boundary\r\n";
                $body .= "Content-Type: $fileType; name=\"$fileName\"\r\n";
                $body .= "Content-Disposition: attachment; filename=\"$fileName\"\r\n";
                $body .= "Content-Transfer-Encoding: base64\r\n\r\n";
                $body .= $fileData . "\r\n\r\n";
            }
        }
    }

    $body .= "--$boundary--";

    // 6. Envoi du Mail final
    if (mail($recipient, $subject, $body, $headers)) {
        header("Location: /contact.html?success=1");
    } else {
        header("Location: /contact.html?error=1");
    }
} else {
    // Si accédé directement sans formulaire
    header("Location: /contact.html");
}
?>
