using Microsoft.AspNetCore.SignalR;

namespace ProjectK.Hubs;

public class ChatHub : Hub
{
    private readonly ILogger<ChatHub> _logger;

    public ChatHub(ILogger<ChatHub> logger)
    {
        _logger = logger;
    }
    
    public async Task NewMessage(string username, string message)
    {
        _logger.LogInformation($"Received message from {username} with {message}");
        await Clients.All.SendAsync("messageReceived", username, message);
    }
}