export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  lat: number | null;
  lng: number | null;
  capturedAt: string;
  activityId: string | null;
  tripId: string | null;
  caption: string;
}
