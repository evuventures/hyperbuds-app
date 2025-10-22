export default async function CollaborationPage({ params }: { params: Promise<{ id: string }> }) {
   const { id } = await params;
   
   return (
      <div className="p-6">
         <h1 className="text-2xl font-bold mb-4">Collaboration Details</h1>
         <p>Collaboration ID: {id}</p>
         <p>Collaboration details coming soon...</p>
      </div>
   );
}
