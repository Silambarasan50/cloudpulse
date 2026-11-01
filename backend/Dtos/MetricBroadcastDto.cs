namespace backend.Dtos;

public record MetricBroadcastDto(
    int EndpointId,
    string EndpointName,
    string Url,
    int StatusCode,
    double ResponseTimeMs,
    bool IsSuccess,
    DateTime Timestamp);
