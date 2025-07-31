import { Icons } from './Icons';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-center items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} ThreadCraft. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}