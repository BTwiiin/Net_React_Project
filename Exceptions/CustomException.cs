namespace CustomExceptions
{
    public class CustomException : Exception
    {
        public int StatusCode { get; }

        public CustomException(string message, int statusCode) : base(message)
        {
            StatusCode = statusCode;
        }
    }

    public class CustomBadRequest : CustomException
    {
        public CustomBadRequest(string message = "Bad request") : base(message, 400)
        {
        }
    }

    public class CustomUnauthorized : CustomException
    {
        public CustomUnauthorized(string message = "Unauthorized") : base(message, 401)
        {
        }
    }

    public class CustomForbidden : CustomException
    {
        public CustomForbidden(string message = "Forbidden") : base(message, 403)
        {
        }
    }

    public class CustomNotFound : CustomException
    {
        public CustomNotFound(string message = "Not found") : base(message, 404)
        {
        }
    }

    public class CustomMethodNotAllowed : CustomException
    {
        public CustomMethodNotAllowed(string message = "Method not allowed") : base(message, 405)
        {
        }
    }

    public class CustomNotAcceptable : CustomException
    {
        public CustomNotAcceptable(string message = "Not acceptable") : base(message, 406)
        {
        }
    }

    public class CustomRequestTimeout : CustomException
    {
        public CustomRequestTimeout(string message = "Request timeout") : base(message, 408)
        {
        }
    }

    public class CustomInternalServerError : CustomException
    {
        public CustomInternalServerError(string message = "Internal server error") : base(message, 500)
        {
        }
    }
}
