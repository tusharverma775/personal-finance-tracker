import React from "react";

export default function Spinner({ className = "h-12 w-12 text-primary-500" }) {
  return (
    <div className="flex items-center justify-center p-6">
      <svg className={className} viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="M43.935 25.145c0-10.318-8.364-18.682-18.682-18.682-10.318 0-18.682 8.364-18.682 18.682h4.068c0-8.052 6.562-14.614 14.614-14.614 8.052 0 14.614 6.562 14.614 14.614h4.068z">
          <animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.9s" repeatCount="indefinite"/>
        </path>
      </svg>
    </div>
  );
}
