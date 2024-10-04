
export const Footer = () => {

    return (

        <footer className="bg-white rounded-lg shadow">
            <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <a href="/" className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse">
                        <img src="/images/logo.png" className="h-8" alt="Flowbite Logo" />
                        <span className="self-center text-2xl font-semibold whitespace-nowrap">Stake & Run</span>
                    </a>
                    <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0">
                        <li>
                            <a href="/" className="hover:underline me-4 md:me-6">Home</a>
                        </li>
                    </ul>
                </div>
                <hr className="my-6 border-gray-200 sm:mx-autolg:my-8" />
                <span className="block text-sm text-gray-500 sm:text-center">© 2024 <a href="/" className="hover:underline">Stake & Run</a>. All Rights Reserved.</span>
            </div>
        </footer>
    );
}
