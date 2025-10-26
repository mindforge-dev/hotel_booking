import CreateHotelForm from "@/components/hotel/CreateHotelForm"

export default function CreateHotelPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col col-md-6 mx-auto gap-8">
        <h1 className="text-3xl font-bold">Create New Hotel</h1>
        <CreateHotelForm />
      </div>
    </div>
  )
}