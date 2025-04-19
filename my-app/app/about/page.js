import Image from "next/image";
import Navbar from "../navbar";

export default function About() {
  return (
    <>
      <Navbar className="navbar" />

      <div className="bg-gray-100 text-gray-800 font-sans">
        <header className=" text-black py-12 text-center">
          <h1 className="text-4xl font-bold mb-2">About Us</h1>
          <p className="text-lg">Learn more about who we are and what we do.</p>
        </header>

        <main className="max-w-4xl mx-auto bg-white p-6 md:p-10 mt-8 rounded shadow">
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
            <p>
              From a hackathon group participating in BroncoHacks2025, our team
              has grown from a small startup into a trusted provider of tech
              solutions. We are passionate about helping people navigate their
              prescription medications with confidence. Our application provides
              trusted information on prescription drugs, including detailed
              potential interactions, nearby pharmacyoptions, and medication
              reminders.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p>
              Our goal is to develop a comprehensive application that empowers
              individuals to make informed decisions about their health by
              providing accurate and accessible information about prescription
              and over-the-counter medications. We aim to promote awareness,
              education, and safe usage practices, helping users understand
              their medications and potential interactions.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
            <p>
              To be a global leader in drug awareness, and shape the future of
              healthcare innovation and patient empowerment.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-6">Meet the Team</h2>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              <div className="bg-gray-50 p-4 rounded-lg shadow text-center">
                
                <h3 className="font-bold">Joshua Estrada</h3>
                <p className="text-sm text-gray-600">Developer</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg shadow text-center">
                <h3 className="font-bold">Jason Mar</h3>
                <p className="text-sm text-gray-600">Developer</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg shadow text-center">
                
                <h3 className="font-bold">Manson Pham</h3>
                <p className="text-sm text-gray-600">Developer</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg shadow text-center">
                
                <h3 className="font-bold">Michael Castillo</h3>
                <p className="text-sm text-gray-600">Developer</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
