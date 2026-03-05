import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Eye,
  ExternalLink,
  Star,
  Sparkles,
  BarChart3,
} from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

// ---------------------------------------------------------------------------
// Mock data (mirrors the web dashboard)
// ---------------------------------------------------------------------------

const STATS = [
  { label: 'Total Views', value: '1,247', change: '+12%', icon: Eye, color: '#10B981' },
  { label: 'Total Clicks', value: '342', change: '+8%', icon: ExternalLink, color: '#3b82f6' },
  { label: 'Review Avg', value: '4.7', change: '', icon: Star, color: '#f59e0b' },
  { label: 'Reviews', value: '23', change: '+3', icon: Star, color: '#a855f7' },
];

const MONTHLY_VIEWS = [
  { month: 'Sep', views: 65 },
  { month: 'Oct', views: 82 },
  { month: 'Nov', views: 95 },
  { month: 'Dec', views: 48 },
  { month: 'Jan', views: 72 },
  { month: 'Feb', views: 110 },
  { month: 'Mar', views: 128 },
  { month: 'Apr', views: 140 },
  { month: 'May', views: 135 },
  { month: 'Jun', views: 162 },
  { month: 'Jul', views: 185 },
  { month: 'Aug', views: 170 },
];

const MOCK_REVIEWS = [
  {
    id: 'r1',
    author: 'Sarah K.',
    stars: 5,
    text: 'Best bike shop in Moab! Great trail recommendations.',
    date: '2 days ago',
  },
  {
    id: 'r2',
    author: 'James P.',
    stars: 4,
    text: 'Good selection and friendly staff. Fair prices.',
    date: '1 week ago',
  },
  {
    id: 'r3',
    author: 'Mika T.',
    stars: 5,
    text: 'Fixed my flat in 10 minutes. Will be back!',
    date: '2 weeks ago',
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DashboardScreen() {
  const maxViews = Math.max(...MONTHLY_VIEWS.map((d) => d.views));

  return (
    <SafeAreaView className="flex-1 bg-cairn-bg" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Header */}
        <View className="flex-row items-center mb-4">
          <Pressable onPress={() => router.back()} className="p-2 -ml-2 mr-2">
            <ArrowLeft size={20} color="#e2e8f0" />
          </Pressable>
          <Text className="text-slate-100 font-bold text-xl">
            Business Dashboard
          </Text>
        </View>

        {/* Info banner */}
        <View className="rounded-xl border border-canopy/30 bg-canopy/10 px-4 py-3 mb-4">
          <Text className="text-canopy text-xs">
            Preview mode — sign in to manage your listing
          </Text>
        </View>

        {/* Stats grid */}
        <View className="flex-row flex-wrap gap-3 mb-4">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="w-[47%]">
                <View className="flex-row items-center mb-2">
                  <View
                    className="h-7 w-7 rounded-lg items-center justify-center mr-2"
                    style={{ backgroundColor: `${stat.color}20` }}
                  >
                    <Icon size={14} color={stat.color} />
                  </View>
                </View>
                <Text className="text-slate-100 font-bold text-xl">
                  {stat.value}
                </Text>
                <View className="flex-row items-center justify-between mt-1">
                  <Text className="text-slate-500 text-xs">{stat.label}</Text>
                  {stat.change ? (
                    <Text className="text-emerald-400 text-xs font-medium">
                      {stat.change}
                    </Text>
                  ) : null}
                </View>
              </Card>
            );
          })}
        </View>

        {/* Monthly views bar chart */}
        <Card className="mb-4">
          <View className="flex-row items-center mb-4">
            <BarChart3 size={16} color="#10B981" />
            <Text className="text-slate-100 font-semibold text-sm ml-2">
              Monthly Views
            </Text>
          </View>

          {/* Chart bars */}
          <View className="flex-row items-end gap-1" style={{ height: 120 }}>
            {MONTHLY_VIEWS.map((d) => {
              const barHeight = (d.views / maxViews) * 100;
              return (
                <View
                  key={d.month}
                  className="flex-1 items-center justify-end"
                >
                  <View
                    className="w-full rounded-t-sm bg-canopy/80"
                    style={{ height: `${barHeight}%` }}
                  />
                </View>
              );
            })}
          </View>

          {/* X-axis labels */}
          <View className="flex-row mt-2">
            {MONTHLY_VIEWS.map((d) => (
              <View key={d.month} className="flex-1 items-center">
                <Text className="text-slate-600 text-[8px]">{d.month}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Recent reviews */}
        <Card className="mb-4">
          <Text className="text-slate-100 font-semibold text-sm mb-3">
            Recent Reviews
          </Text>
          {MOCK_REVIEWS.map((review, idx) => (
            <View
              key={review.id}
              className={`pb-3 ${idx < MOCK_REVIEWS.length - 1 ? 'border-b border-cairn-border mb-3' : ''}`}
            >
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-slate-200 text-sm font-medium">
                  {review.author}
                </Text>
                <Text className="text-slate-600 text-xs">{review.date}</Text>
              </View>
              <View className="flex-row items-center gap-0.5 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    color={i < review.stars ? '#f59e0b' : '#334155'}
                    fill={i < review.stars ? '#f59e0b' : 'transparent'}
                  />
                ))}
              </View>
              <Text className="text-slate-400 text-xs leading-relaxed">
                {review.text}
              </Text>
            </View>
          ))}
        </Card>

        {/* Spotlight upsell */}
        <View className="rounded-2xl border-2 border-amber-500/40 bg-amber-500/5 p-5">
          <View className="flex-row items-start">
            <View className="h-10 w-10 rounded-xl bg-amber-500/10 items-center justify-center mr-3">
              <Sparkles size={20} color="#f59e0b" />
            </View>
            <View className="flex-1">
              <Text className="text-amber-400 font-bold text-base mb-1">
                Upgrade to Spotlight
              </Text>
              <Text className="text-slate-400 text-xs mb-3">
                Get premium visibility and attract more outdoor enthusiasts.
              </Text>

              {[
                'Gold Spotlight pin on the map',
                'Priority search ranking',
                'Monthly analytics dashboard',
                'Special offer banner',
                'Founding rate locked in',
              ].map((benefit) => (
                <View key={benefit} className="flex-row items-center mb-1.5">
                  <Star size={10} color="#f59e0b" />
                  <Text className="text-slate-300 text-xs ml-2">{benefit}</Text>
                </View>
              ))}

              <Button
                variant="spotlight"
                size="md"
                className="mt-3"
              >
                <View className="flex-row items-center">
                  <Sparkles size={14} color="white" />
                  <Text className="text-white font-semibold text-sm ml-2">
                    Get Spotlight — $199/yr
                  </Text>
                </View>
              </Button>
            </View>
          </View>
        </View>

        {/* Business info summary */}
        <Card className="mt-4">
          <Text className="text-slate-100 font-semibold text-sm mb-2">
            Business Info
          </Text>
          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-slate-500 text-xs">Name</Text>
              <Text className="text-slate-300 text-xs">Red Rock Bike Shop</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-slate-500 text-xs">Category</Text>
              <Badge label="Bike Shop" variant="green" />
            </View>
            <View className="flex-row justify-between">
              <Text className="text-slate-500 text-xs">Location</Text>
              <Text className="text-slate-300 text-xs">Moab, UT</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-slate-500 text-xs">Tier</Text>
              <Badge label="Free" variant="default" />
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
