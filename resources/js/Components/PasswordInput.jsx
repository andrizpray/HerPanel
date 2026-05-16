import { forwardRef, useState } from 'react';

export default forwardRef(function PasswordInput(
    { className = '', ...props },
    ref,
) {
    const [show, setShow] = useState(false);

    return (
        <div className="relative">
            <input
                {...props}
                type={show ? 'text' : 'password'}
                className={
                    'w-full rounded-md border-hpBorder bg-hpBg text-white placeholder:text-hpText3 focus:border-hpAccent focus:ring-hpAccent pr-10 ' +
                    className
                }
                ref={ref}
            />
            <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-hpText3 hover:text-hpAccent2 transition-colors"
                tabIndex={-1}
            >
                {show ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9-7a9.97 9.97 0 012.115-3.91M6.75 6.75l10.5 10.5M17.25 8.75a4 4 0 015.25 5.25 9.953 9.953 0 01-1.25 2.25M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9 7 0 .392-.025.775-.052 1.158C20.26 17.055 16.478 21 12 21c-4.478 0-8.268-2.943-9-7 0-.392.025-.775.052-1.158z" />
                    </svg>
                )}
            </button>
        </div>
    );
});