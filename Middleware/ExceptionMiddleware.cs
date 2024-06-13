using System.Net;
using Newtonsoft.Json;
using CustomExceptions;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;

    public ExceptionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var errorResponse = new ErrorResponse
        {
            Success = false,
            Message = "Internal Server Error"
        };
        int statusCode = (int)HttpStatusCode.InternalServerError;
        if (exception is CustomException)
        {
            errorResponse.Message = exception.Message;
            statusCode = (exception as CustomException).StatusCode;
        }
        context.Response.StatusCode = statusCode;
        var jsonError = JsonConvert.SerializeObject(errorResponse);
        await context.Response.WriteAsync(jsonError);
        Console.WriteLine(exception.Message, exception.StackTrace);
    }
}

public class ErrorResponse
{
    public bool Success { get; set; }
    public string? Message { get; set; }
}