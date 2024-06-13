using Models;

namespace Responses
{
    public class AuthenticatedResponse
    {
        public string Token { get; set; } = "";
        public string RefreshToken { get; set; } = "";
    }

    public class UserInfoResponse
    {
        public string Username { get; set; } = "";
        public decimal HourlyRate { get; set; } = 0;
        public string Id { get; set; } = "";

        public Ticket[] Tickets { get; set; } = [];

        public TimeSlot[] TimeSlots { get; set; } = [];
    }
}