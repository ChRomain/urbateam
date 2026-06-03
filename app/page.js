import Hero from '../components/Hero';
import Stats from '../components/Stats';
import Expertise from '../components/Expertise';
import References from '../components/References';
import Testimonials from '../components/Testimonials';
import { getClients } from '../lib/supabase';

export default async function Home() {
  const clients = await getClients();
  return (
    <>
      <Hero />
      <Stats />
      <Expertise />
      <References clients={clients} />
      <Testimonials />
    </>
  );
}
