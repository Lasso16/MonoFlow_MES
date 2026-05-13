using MediatR;

namespace MonoFlow.application.Common
{
    public class CommandResult
    {
        public bool Success { get; private set; }
        public string Message { get; private set; }

        protected CommandResult(bool success, string message)
        {
            Success = success;
            Message = message;
        }

        public static CommandResult Ok(string message = "") => new CommandResult(true, message);
        public static CommandResult Fail(string message) => new CommandResult(false, message);
    }

    public class CommandResult<T> : CommandResult
    {
        public T Data { get; private set; }

        private CommandResult(bool success, string message, T data) : base(success, message)
        {
            Data = data;
        }

        public static CommandResult<T> Ok(T data, string message = "") => new CommandResult<T>(true, message, data);
        public static new CommandResult<T> Fail(string message) => new CommandResult<T>(false, message, default);
    }
}
