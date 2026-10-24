
export default function Equipment() {
  return (
    <div className="flex min-h-[85vh] w-full items-center justify-center bg-[#f6f8fc] px-4 dark:bg-[#0b1424]">
      <style>{`
        @keyframes comingSoon {
          0% {
            opacity: 0;
            transform: translateY(25px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .coming-soon-animation {
          animation: comingSoon 1s ease-out both;
        }
      `}</style>

      <h1 className="coming-soon-animation text-center text-4xl font-black tracking-tight text-[#10264d] dark:text-white sm:text-5xl">
        Coming{" "}
        <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
          Soon
        </span>
      </h1>
    </div>
  );
}
