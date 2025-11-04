import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative isolate overflow-hidden bg-white">
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
          <div className="mt-24 sm:mt-32 lg:mt-16">
            <a href="#" className="inline-flex space-x-6">
              <span className="rounded-full bg-indigo-600/10 px-3 py-1 text-sm font-semibold leading-6 text-indigo-600 ring-1 ring-inset ring-indigo-600/10">
                What&apos;s new
              </span>
              <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-gray-600">
                <span>Just shipped v1.0</span>
              </span>
            </a>
          </div>
          <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Campus Food Made Easy
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Explore campus canteens, view menus, order food, and manage your dining experience - all in one place.
          </p>
          <div className="mt-10 flex items-center gap-x-6">
            <Link
              href="/canteens"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Explore Canteens
            </Link>
            <Link href="/register" className="text-sm font-semibold leading-6 text-gray-900">
              Register Now <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
          <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
            <div className="rounded-lg bg-gray-50 p-4 ring-1 ring-inset ring-gray-900/5">
              {/* Placeholder for a nice image or illustration */}
              <div className="h-[400px] w-[600px] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
