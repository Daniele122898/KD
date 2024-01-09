using System.Globalization;
using Microsoft.AspNetCore.SignalR;

namespace ProjectK.Hubs;

public class VideoHub(ILogger<ChatHub> logger) : Hub
{
    private double _videoTimestamp;
    private string _videoUrl;

    private const uint _OFF_TOLERANCE_S = 2;

    public async Task GetCurrentState()
    {
        var currTs = DateTime.UtcNow.ToString("o", CultureInfo.InvariantCulture);
        await Clients.Caller.SendAsync("currentStatus", _videoTimestamp, _videoUrl, currTs);
    }

    public async Task UpdateState(double videoTs, string videoUrl, string ts)
    {
        logger.LogInformation($"Received State Update ts {videoTs} with url {videoUrl} at {ts}");
        _videoTimestamp = videoTs;
        _videoUrl = videoUrl;
        await Clients.All.SendAsync("currentStatus", videoTs, videoUrl, ts);
    }
}