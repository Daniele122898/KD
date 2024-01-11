using System.Globalization;
using Microsoft.AspNetCore.SignalR;
using ProjectK.Repositories;

namespace ProjectK.Hubs;

public class VideoHub(ILogger<ChatHub> logger, VideoStateRepository videoState) : Hub
{
    private const uint _OFF_TOLERANCE_S = 2;

    public async Task GetCurrentState()
    {
        var currTs = DateTime.UtcNow.ToString("o", CultureInfo.InvariantCulture);
        logger.LogInformation($"Received request for current state, returning {videoState.VideoTimestamp} {videoState.VideoUrl}");
        await Clients.Caller.SendAsync("currentStatus", videoState.VideoTimestamp, videoState.VideoUrl, currTs);
    }

    public async Task UpdateState(double videoTs, string videoUrl, string ts)
    {
        logger.LogInformation($"Received State Update ts {videoTs} with url {videoUrl} at {ts}");
        videoState.VideoTimestamp = videoTs;
        videoState.VideoUrl = videoUrl;
        await Clients.All.SendAsync("currentStatus", videoTs, videoUrl, ts);
    }

    public async Task SeekTo(double videoTs, string ts)
    {
        logger.LogInformation($"Seek to {videoTs} at {ts}");
        videoState.VideoTimestamp = videoTs;
        await Clients.All.SendAsync("seek", videoTs, ts);
    }
}