using System;
using System.Collections.Generic;
using System.Text;

namespace MonoFlow.domain.Aggregates.Result
{
    public enum SuccessStatus
    {
        None,
        Created,
        Updated,
        Deleted,
    }

    public enum FailureStatus
    {
        None,
        NotFound,
        Validation,
        Repository,
    }

    public class Result
    {
        public bool IsSuccess { get; }

        public bool IsFailure => !IsSuccess;

        public string? Error { get; }

        public SuccessStatus SuccessStatus { get; private set; } = SuccessStatus.None;

        public FailureStatus FailureStatus { get; private set; } = FailureStatus.None;


        protected Result(bool isSuccess, string? error)
        {
            if (isSuccess && error is not null)
                throw new ArgumentException("Invalid error", nameof(error));

            if (!isSuccess && error is null)
                throw new ArgumentException("Invalid error", nameof(error));

            IsSuccess = isSuccess;
            Error = error;
        }

        #region Success

        public static Result Success() => new Result(true, null);

        public static Result<TValue> Success<TValue>(TValue value) => new(value, true, null);

        public static Result<TValue> CreatedSuccess<TValue>(TValue value) => new(value, true, null) { SuccessStatus = SuccessStatus.Created };

        public static Result<TValue> UpdatedSuccess<TValue>(TValue value) => new(value, true, null) { SuccessStatus = SuccessStatus.Updated };

        public static Result DeletedSuccess() => new Result(true, null) { SuccessStatus = SuccessStatus.Deleted };

        #endregion

        #region Failure

        public static Result Failure(string error) => new Result(false, error);

        public static Result<TValue> Failure<TValue>(string error) => new(default, false, error);

        public static Result NotFoundFailure(string error) => new(false, error) { FailureStatus = FailureStatus.NotFound };

        public static Result<TValue> NotFoundFailure<TValue>(string error) => new(default, false, error) { FailureStatus = FailureStatus.NotFound };

        public static Result ValidationFailure(string error) => new(false, error) { FailureStatus = FailureStatus.Validation };

        public static Result<TValue> ValidationFailure<TValue>(string error) => new(default, false, error) { FailureStatus = FailureStatus.Validation };

        public static Result RepositoryFailure(string error) => new(false, error) { FailureStatus = FailureStatus.Repository };

        public static Result<TValue> RepositoryFailure<TValue>(string error) => new(default, false, error) { FailureStatus = FailureStatus.Repository };

        #endregion
    }

    public class Result<TValue> : Result
    {
        private readonly TValue? _value;

        public Result(TValue? value, bool isSuccess, string? error) : base(isSuccess, error)
        {
            _value = value;
        }

        public TValue Value
        {
            get
            {
                if (!IsSuccess)
                    throw new InvalidOperationException("No value for failure.");

                return _value!;
            }
        }
    }

}
