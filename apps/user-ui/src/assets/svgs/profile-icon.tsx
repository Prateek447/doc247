const ProfileIcon = (props: any) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle
        cx={8.57894}
        cy={5.77803}
        r={4.77803}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M1 17.2C1 16 2 14.5 4 14c1.5-.3 3.5-.5 5.5-.5s4 .2 5.5.5c2 .5 3 2 3 3.2v1.3c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V17.2z"
      />
    </svg>
  );
  export default ProfileIcon;
  