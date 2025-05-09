const Loading = () => {
  return (
    <div className="flex items-center justify-center h-44">
      <div className="flex space-x-2">
        {/* Animated circles */}
        <div className="w-4 h-4 bg-green-primary rounded-full animate-bounce"></div>
        <div className="w-4 h-4 bg-green-primary rounded-full animate-bounce delay-200"></div>
        <div className="w-4 h-4 bg-green-primary rounded-full animate-bounce delay-400"></div>
      </div>
    </div>
  );
};

export default Loading;
