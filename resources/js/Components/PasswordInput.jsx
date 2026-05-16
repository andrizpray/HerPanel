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
                className={'border rounded px-3 py-2 w-full ' + className}
                ref={ref}
            />
            <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-2 top-1/2 -translate-y-1/2"
                tabIndex={-1}
            >
                {show ? '🙈' : '👁️'}
            </button>
        </div>
    );
});