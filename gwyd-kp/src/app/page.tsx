import { Navbar } from "~/app/_components/navbar";

export default async function Home() {


  return (
    <div>
      <Navbar />
      <div className="container py-8 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Gwyd-KP</h1>
        <p className="text-lg mb-6">
          A tool for looking at our KP data.
        </p>




      </div>
    </div>
  );
}
