
import React from 'react';

interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  description: string;
  required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ label, name, value, onChange, placeholder, description, required }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-300 capitalize mb-1">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <input
      type="text"
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="block w-full rounded-md border-0 bg-white/5 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 transition-shadow duration-200"
    />
    <p className="mt-2 text-xs text-gray-400">{description}</p>
  </div>
);

export default InputField;
