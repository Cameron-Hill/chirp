export const LoadingSpinner = (props: { size?: number }) => {
  return (
    <div
      style={{ width: props.size ?? 14, height: props.size ?? 14 }}
      className="inline-block animate-spin rounded-full border-4 border-solid border-current border-r-transparent fill-slate-300 align-[-0.125em] text-slate-300 motion-reduce:animate-[spin_1.5s_linear_infinite]"
      role="status"
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  );
};

export const LoadingPage = () => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <LoadingSpinner size={45} />
    </div>
  );
};
