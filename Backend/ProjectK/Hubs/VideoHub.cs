using System.Globalization;
using Microsoft.AspNetCore.SignalR;
using ProjectK.Repositories;

namespace ProjectK.Hubs;

public class VideoHub(ILogger<ChatHub> logger, VideoStateRepository videoState) : Hub
{
    public async Task GetCurrentState()
    {
        var currTs = DateTime.UtcNow.ToString("o", CultureInfo.InvariantCulture);
        logger.LogInformation($"Received request for current state, returning {videoState.VideoTimestamp} {videoState.VideoUrl} {videoState.IsPlaying}");
        await Clients.Caller.SendAsync("getState", videoState.VideoTimestamp, videoState.VideoUrl, videoState.IsPlaying, currTs);
    }

    public async Task UpdateState(double videoTs, string videoUrl, bool isPlaying, string ts)
    {
        logger.LogInformation($"Received State Update ts {videoTs} with url {videoUrl} at {ts}");
        videoState.VideoTimestamp = videoTs;
        videoState.VideoUrl = videoUrl;
        videoState.IsPlaying = isPlaying;
        await Clients.All.SendAsync("currentStatus", videoTs, videoUrl, isPlaying, ts);
    }

    public async Task SeekTo(double videoTs, string ts)
    {
        logger.LogInformation($"Seek to {videoTs} at {ts}");
        videoState.VideoTimestamp = videoTs;
        await Clients.All.SendAsync("seek", videoTs, ts);
    }
    
    public async Task UpdatePlayState(bool isPlaying, string ts)
    {
        logger.LogInformation($"Update play state to {isPlaying} at {ts}");
        videoState.IsPlaying = isPlaying;
        await Clients.All.SendAsync("playState", isPlaying, ts);
    }
}