using Microsoft.AspNetCore.SignalR;

namespace ProjectK.Hubs;

public class ChatHub(ILogger<ChatHub> logger) : Hub
{
    public async Task NewMessage(string username, string message)
    {
        logger.LogInformation($"Received message from {username} with {message}");
        await Clients.All.SendAsync("messageReceived", username, message);
    }
}