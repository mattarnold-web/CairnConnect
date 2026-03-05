import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import type { RecordedActivity } from './activity-types';

export function exportToGpx(activity: RecordedActivity): string {
  const points = activity.gpsTrack
    .map((pt) => {
      const ele = pt.altitude != null ? `    <ele>${pt.altitude.toFixed(1)}</ele>` : '';
      const time = `    <time>${new Date(pt.timestamp).toISOString()}</time>`;
      return `   <trkpt lat="${pt.lat}" lon="${pt.lng}">\n${ele}\n${time}\n   </trkpt>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Cairn Connect"
  xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${escapeXml(activity.title)}</name>
    <time>${activity.startedAt}</time>
  </metadata>
  <trk>
    <name>${escapeXml(activity.title)}</name>
    <type>${escapeXml(activity.activityType)}</type>
    <trkseg>
${points}
    </trkseg>
  </trk>
</gpx>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function shareGpx(activity: RecordedActivity): Promise<void> {
  const gpx = exportToGpx(activity);
  const filename = activity.title.replace(/[^a-zA-Z0-9]/g, '_');
  const path = `${FileSystem.documentDirectory}${filename}.gpx`;
  await FileSystem.writeAsStringAsync(path, gpx);
  await Sharing.shareAsync(path, { mimeType: 'application/gpx+xml' });
}
