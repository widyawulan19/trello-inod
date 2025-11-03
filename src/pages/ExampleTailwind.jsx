import React from 'react'

function ExampleTailwind() {
  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100'>
        <h1 className='text-4xl font-bold text-blue-600'>Hallo, Tailwind 3!</h1>
        <h2 className='text-base md:text-lg lg:text-xl'>
            Responsive Text
        </h2>
        <div className="p-2 text-white transition duration-200 bg-blue-500 rounded shadow-md hover:bg-blue-600"></div>
    </div>
  )
}

export default ExampleTailwind