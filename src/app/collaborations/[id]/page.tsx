export default function CollaborationPage({ params }: { params: { id: string } }) {
   return (
      <div className="p-6">
         <h1 className="text-2xl font-bold mb-4">Collaboration Details</h1>
         <p>Collaboration ID: {params.id}</p>
         <p>Collaboration details coming soon...</p>
      </div>
   );
}
