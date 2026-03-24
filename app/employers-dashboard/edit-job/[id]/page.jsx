import dynamic from 'next/dynamic';
import EditJob from '@/components/dashboard-pages/employers-dashboard/edit-job';

export const metadata = {
  title: 'Vacature bewerken | De Flexijobber',
  description: 'Bewerk uw geplaatste vacature in het werkgeversdashboard.',
};

const Page = () => {
  return <EditJob />;
};

export default dynamic(() => Promise.resolve(Page), { ssr: false });
