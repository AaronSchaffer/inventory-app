import Link from 'next/link';

export default function MainMenu() {
  return (
    <div className="bg-white rounded-lg shadow p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Main Menu</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {/* Home/Lots Section */}
        <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Home/Lots</h2>
          <div className="space-y-2">
            <Link href="/groups" className="block w-full text-left px-4 py-2 bg-white rounded hover:bg-blue-100 border border-blue-200">
              New Group
            </Link>
            <Link href="/groups/key-details" className="block w-full text-left px-4 py-2 bg-white rounded hover:bg-blue-100 border border-blue-200">
              Edit Key Group Details
            </Link>
            <Link href="/groups/all-details" className="block w-full text-left px-4 py-2 bg-white rounded hover:bg-blue-100 border border-blue-200">
              Edit All Group Details
            </Link>
          </div>
        </div>

        {/* Brockoff Section */}
        <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
          <h2 className="text-xl font-semibold text-green-800 mb-4">Brockoff</h2>
          <div className="space-y-2">
            <Link href="/brockoff" className="block w-full text-left px-4 py-2 bg-white rounded hover:bg-green-100 border border-green-200">
              Add-Edit Group
            </Link>
          </div>
        </div>

        {/* Other Options */}
        <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Other</h2>
          <div className="space-y-2">
            <Link href="/pens" className="block w-full text-left px-4 py-2 bg-white rounded hover:bg-gray-100 border border-gray-200">
              Edit Pens
            </Link>
            <Link href="/cattle-by-pen" className="block w-full text-left px-4 py-2 bg-white rounded hover:bg-gray-100 border border-gray-200">
              Edit Cattle by Pen
            </Link>
            <Link href="/hedging" className="block w-full text-left px-4 py-2 bg-white rounded hover:bg-gray-100 border border-gray-200">
              Hedging
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
