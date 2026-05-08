import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  Animated,
  FlatList,
  Platform,
  Vibration
} from 'react-native';
import { 
  Clock, 
  Users, 
  UserCheck, 
  ChevronRight, 
  Bell, 
  MoreVertical, 
  Plus, 
  LayoutGrid, 
  QrCode, 
  Search, 
  ClipboardList, 
  Home, 
  FileText,
  Scan,
  Copy,
  AlertTriangle,
  User
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
// Adjusted width for centered snapping cards
const CARD_WIDTH = width - 40;
const CARD_MARGIN = 12;

export const DashboardScreen = ({ colors, isDark, onScan }) => {
  const [heroIndex, setHeroIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  // Hero card data strictly matching Image 2 visuals
  const heroCards = [
    { 
      id: '1', 
      title: "Marked by you", 
      tag: "PERSONAL", 
      count: "14", 
      ampm: "", 
      status: "Total recorded by you today", 
      color: "#395EE1",
      glowColor: "#EBF3FF",
      tagBg: "#EDF2FE",
      tagText: "#4271E8",
      icon: <User color="#A0BBF6" size={26} strokeWidth={2.5} />, 
      buttonText: "Mark Late",
      iconBtn: <Plus size={16} color="#fff" strokeWidth={4} style={{marginRight: 4}} />
    },
    { 
      id: '2', 
      title: "Total latecomers", 
      tag: "COMMITTEE", 
      count: "112", 
      ampm: "", 
      status: "Recorded by all members", 
      color: "#10B981", 
      glowColor: "#ECFDF5",
      tagBg: "#ECFDF5",
      tagText: "#059669",
      icon: <Users color="#6EE7B7" size={30} strokeWidth={2.5} />, 
      buttonText: "Global Logs",
      iconBtn: <LayoutGrid size={16} color="#fff" strokeWidth={3} style={{marginRight: 4}} />
    },
    { 
      id: '3', 
      title: "Duty started on", 
      tag: "FACULTY", 
      count: "07:58", 
      ampm: "AM", 
      status: "Shift active since", 
      color: "#F59E0B", 
      glowColor: "#FFFBEB",
      tagBg: "#FEF3C7",
      tagText: "#D97706",
      icon: <Clock color="#FCD34D" size={30} strokeWidth={2.5} />, 
      buttonText: "Shift Info",
      iconBtn: <AlertTriangle size={16} color="#fff" strokeWidth={3} style={{marginRight: 4}} />
    }
  ];

  // Auto-slide carousel effect
  useEffect(() => {
    const timer = setInterval(() => {
      let nextIndex = (heroIndex + 1) % heroCards.length;
      flatListRef.current?.scrollToIndex({ 
        index: nextIndex, 
        animated: true,
        viewPosition: 0.5 
      });
      setHeroIndex(nextIndex);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroIndex]);

  const handleCopyId = () => {
    if (Platform.OS !== 'web') Vibration.vibrate(50);
  };

  const renderHeroItem = ({ item }) => (
    <View style={[styles.heroCard, isDark && styles.heroCardDark]}>
      {/* Visual Radial Glow in top right */}
      <View style={[styles.heroGlow, { backgroundColor: item.glowColor, opacity: isDark ? 0.05 : 0.7 }]} />
      
      <View style={styles.heroHeader}>
        <Text style={[styles.heroSub, isDark && styles.textDark]}>{item.title}</Text>
        <View style={[styles.tag, { backgroundColor: isDark ? '#1E293B' : item.tagBg }]}>
          <Text style={[styles.tagText, { color: item.tagText }]}>{item.tag}</Text>
        </View>
      </View>
      
      <View style={styles.heroBody}>
        <View style={styles.heroCountArea}>
          <View style={styles.countRow}>
            <Text style={[styles.count, isDark && styles.textWhite]}>{item.count}</Text>
            {/* Decoration User Icon from Image 2 */}
            <View style={styles.heroIconDecoration}>{item.icon}</View>
            {item.ampm !== "" && <Text style={[styles.ampm, isDark && styles.textDarkMuted]}>{item.ampm}</Text>}
          </View>
        </View>
        
        <TouchableOpacity style={[styles.heroBtn, { backgroundColor: item.color }]} activeOpacity={0.8}>
          {item.iconBtn}
          <Text style={styles.heroBtnText}>{item.buttonText}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.heroDivider, isDark && styles.dividerDark]} />

      <View style={styles.heroFooter}>
        <AlertTriangle size={15} color="#E28A3B" strokeWidth={2.5} />
        <Text style={[styles.footerText, isDark && styles.textDarkMuted]}>
          {item.status} :
        </Text>
        <ChevronRight size={14} color="#94A3B8" strokeWidth={2.5} />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Header matching Image 2 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.profileBox} activeOpacity={0.9}>
            <Text style={styles.profileText}>F</Text>
            <View style={[styles.activeDot, isDark && styles.borderDark]} />
          </TouchableOpacity>
          
          <View style={[styles.statusPill, isDark && styles.statusPillDark]}>
            <View style={styles.statusInfo}>
              <Text style={[styles.statusTitle, isDark && {color: '#4ADE80'}]}>Network is stable</Text>
              <Text style={[styles.statusDate, isDark && {color: '#22C55E'}]}>LAST SYNC ON 02/05/26</Text>
            </View>
            <View style={[styles.statusArrowBox, isDark && {backgroundColor: '#22C55E'}]}>
              <ChevronRight size={10} color="#fff" strokeWidth={5} />
            </View>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={[styles.iconBtn, isDark && styles.iconBtnDark]}>
            <Bell size={18} color={isDark ? "#CBD5E1" : "#64748B"} strokeWidth={2.5} />
            <View style={[styles.notificationDot, isDark && styles.borderDark]} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, isDark && styles.iconBtnDark]}>
            <MoreVertical size={18} color={isDark ? "#CBD5E1" : "#64748B"} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Carousel List */}
        <FlatList
          ref={flatListRef}
          data={heroCards}
          renderItem={renderHeroItem}
          horizontal
          pagingEnabled={false}
          snapToInterval={CARD_WIDTH + CARD_MARGIN}
          snapToAlignment="center"
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onMomentumScrollEnd={(e) => {
            setHeroIndex(Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_MARGIN)));
          }}
          keyExtractor={(item) => item.id}
          style={styles.heroList}
          contentContainerStyle={styles.heroListContent}
        />

        {/* Indicator & ID Row matching Image 2 */}
        <View style={styles.indicatorRow}>
          <View style={styles.dotsGroup}>
            <View style={[styles.fractionPill, isDark && styles.iconBtnDark]}>
              <Text style={[styles.fractionText, isDark && styles.textWhite]}>{heroIndex + 1}/{heroCards.length}</Text>
            </View>
            <View style={styles.dotsRow}>
              {heroCards.map((_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.indicatorDot, 
                    i === heroIndex ? (isDark ? styles.activeDotDark : styles.activeDotLight) : (isDark ? styles.inactiveDotDark : styles.inactiveDotLight),
                    { width: i === heroIndex ? 10 : 4.5 }
                  ]} 
                />
              ))}
            </View>
          </View>
          
          <TouchableOpacity style={styles.facultyIdBox} onPress={handleCopyId} activeOpacity={0.7}>
            <Text style={[styles.idLabel, isDark && styles.textDarkMuted]}>
              FACULTY ID: <Text style={[styles.idValue, isDark && styles.textWhite]}>member@mic.edu</Text>
            </Text>
            <View style={[styles.copyBtn, isDark && styles.copyBtnDark]}>
              <Copy size={11} color="#D89B48" strokeWidth={3} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Actions Grid matching Image 2 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDark && styles.textWhite]}>QUICK ACTIONS</Text>
            <TouchableOpacity style={[styles.allStatsBtn, isDark && styles.copyBtnDark]}>
              <LayoutGrid size={12} color="#D89B48" strokeWidth={3.5} />
              <Text style={styles.allStatsText}>All Stats</Text>
              <ChevronRight size={12} color="#D89B48" strokeWidth={4.5} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.actionsGrid}>
            <QuickActionItem icon={<QrCode color="#F97316" />} l1="SCAN" l2="ID CARD" isDark={isDark} onPress={onScan} />
            <QuickActionItem icon={<Search color="#3B82F6" />} l1="SEARCH" l2="ROLL NO" isDark={isDark} />
            <QuickActionItem icon={<ClipboardList color="#10B981" />} l1="DAILY" l2="RECORDS" isDark={isDark} />
          </View>
        </View>

        {/* Recent Activity Section matching Image 5 */}
        <View style={[styles.section, { marginTop: 35 }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDark && styles.textWhite]}>RECENT LATECOMERS</Text>
            <TouchableOpacity style={[styles.allStatsBtn, isDark && styles.copyBtnDark]}>
              <Text style={styles.allStatsText}>See All</Text>
              <ChevronRight size={12} color="#D89B48" strokeWidth={4.5} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.tabsRow}>
             <TouchableOpacity style={[styles.activeTab, isDark && styles.copyBtnDark]}>
                <Text style={styles.activeTabText}>SUBMITTED BY YOU</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.inactiveTab}>
                <Text style={styles.inactiveTabText}>TODAY</Text>
             </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activityScroll}>
            <ActivityCard initials="SK" name="SANDEEP K." id="22H71A05A1" dept="CSE-3A" date="03 May 2026" isDark={isDark} />
            <ActivityCard initials="MA" name="MOHIT A." id="22H71A0442" dept="ECE-2B" date="03 May 2026" isDark={isDark} />
            <ActivityCard initials="RP" name="RIYA P." id="22H71A03B5" dept="MECH-1C" date="03 May 2026" isDark={isDark} />
          </ScrollView>
        </View>
      </ScrollView>

      {/* Floating Scan Button sticky above nav */}
      <TouchableOpacity style={styles.fab} onPress={onScan} activeOpacity={0.9}>
        <Scan size={18} color="#fff" strokeWidth={3} />
        <Text style={styles.fabText}>SCAN</Text>
      </TouchableOpacity>

      {/* Persistent Navigation Bar */}
      <View style={[styles.bottomNav, isDark && styles.bottomNavDark]}>
        <TouchableOpacity style={styles.navItem}>
          <View style={[styles.navIconActive, isDark && styles.copyBtnDark]}>
            <Home size={20} color="#DCA766" strokeWidth={2.5} />
          </View>
          <Text style={styles.navLabelActive}>HOME</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navBadge} />
          <FileText size={22} color="#94A3B8" strokeWidth={2.5} />
          <Text style={styles.navLabelMuted}>NOTICES</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const QuickActionItem = ({ icon, l1, l2, isDark, onPress }) => (
  <TouchableOpacity style={[styles.actionItem, isDark && styles.actionItemDark]} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.actionIconWrapper}>
      {React.cloneElement(icon, { size: 28, strokeWidth: 2 })}
    </View>
    <Text style={[styles.actionLabel, isDark && styles.textWhite]}>{l1}</Text>
    <Text style={[styles.actionLabel, isDark && styles.textWhite]}>{l2}</Text>
  </TouchableOpacity>
);

const ActivityCard = ({ initials, name, id, dept, date, isDark }) => (
  <TouchableOpacity style={[styles.activityCard, isDark && styles.actionItemDark]} activeOpacity={0.8}>
    <View style={styles.activityAvatar}>
      <Text style={styles.activityAvatarText}>{initials}</Text>
    </View>
    <Text style={[styles.activityName, isDark && styles.textWhite]} numberOfLines={1}>{name}</Text>
    <Text style={styles.activityId}>{id}</Text>
    <Text style={styles.activityDept}>{dept}</Text>
    <View style={[styles.activityDivider, isDark && styles.dividerDark]} />
    <View style={styles.activityFooter}>
      <Text style={[styles.activityDate, isDark && styles.textDark]}>{date}</Text>
      <View style={styles.activityStatusRow}>
        <Clock size={10} color={isDark ? '#94A3B8' : '#76849D'} strokeWidth={3.5} />
        <Text style={styles.activityStatusText}>LATE</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F5F8' },
  containerDark: { backgroundColor: '#0F172A' },
  scrollContent: { paddingTop: 10, paddingBottom: 160 },
  
  // Header
  header: { 
    paddingTop: Platform.OS === 'ios' ? 55 : 45, 
    paddingHorizontal: 20, 
    paddingBottom: 10, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    zIndex: 100
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  profileBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#E5A653', alignItems: 'center', justifyContent: 'center' },
  profileText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  activeDot: { position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, borderRadius: 6, backgroundColor: '#4ADE80', borderWidth: 2, borderColor: '#F2F5F8' },
  
  statusPill: { 
    marginLeft: 10, backgroundColor: '#E9F6ED', borderRadius: 20,
    paddingLeft: 10, paddingRight: 5, paddingVertical: 4, 
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#D1FAE5'
  },
  statusPillDark: { backgroundColor: '#064E3B', borderColor: '#065F46' },
  statusInfo: { marginRight: 6 },
  statusTitle: { color: '#267B54', fontSize: 10.5, fontWeight: '900', letterSpacing: -0.2 },
  statusDate: { color: '#89C2A4', fontSize: 7, fontWeight: '900', marginTop: 1, letterSpacing: 0.3 },
  statusArrowBox: { backgroundColor: '#3F8666', width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  
  headerRight: { flexDirection: 'row' },
  iconBtn: { width: 40, height: 40, backgroundColor: '#FFFFFF', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginLeft: 8, shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.03, shadowRadius: 5, elevation: 2 },
  iconBtnDark: { backgroundColor: '#1E293B', shadowOpacity: 0 },
  notificationDot: { position: 'absolute', top: 11, right: 11, width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: '#FFFFFF' },
  
  // Carousel
  heroList: { width: width, marginBottom: 15 },
  heroListContent: { paddingHorizontal: 20 },
  heroCard: { width: CARD_WIDTH, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 22, marginRight: CARD_MARGIN, shadowColor: '#000', shadowOffset: {height: 8, width: 0}, shadowOpacity: 0.05, shadowRadius: 15, elevation: 3, overflow: 'hidden' },
  heroCardDark: { backgroundColor: '#1E293B' },
  heroGlow: { position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: 70 },
  
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, zIndex: 10 },
  heroSub: { fontSize: 14, fontWeight: '700', color: '#2E3A59' },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  
  heroBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, zIndex: 10 },
  heroCountArea: { flexDirection: 'row', alignItems: 'center' },
  countRow: { flexDirection: 'row', alignItems: 'center' },
  count: { fontSize: 44, fontWeight: '900', letterSpacing: -1.5, color: '#0A1128' },
  heroIconDecoration: { marginLeft: 8, marginTop: 4 },
  ampm: { fontSize: 14, fontWeight: '900', marginLeft: 6, color: '#76849D' },
  
  heroBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, flexDirection: 'row', alignItems: 'center' },
  heroBtnText: { color: '#fff', fontSize: 13, fontWeight: '900', marginLeft: 2 },
  
  heroDivider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 14 },
  dividerDark: { backgroundColor: '#334155' },
  
  heroFooter: { flexDirection: 'row', alignItems: 'center' },
  footerText: { flex: 1, fontSize: 11.5, fontWeight: '700', color: '#76849D', marginLeft: 8 },
  
  // Indicators
  indicatorRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, marginBottom: 30 },
  dotsGroup: { flexDirection: 'row', alignItems: 'center' },
  fractionPill: { backgroundColor: '#FFFFFF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 10 },
  fractionText: { fontSize: 10, fontWeight: '900', color: '#1C2942' },
  dotsRow: { flexDirection: 'row', alignItems: 'center' },
  indicatorDot: { height: 4.5, borderRadius: 2.25, marginHorizontal: 2.5 },
  activeDotLight: { backgroundColor: '#1E293B' },
  inactiveDotLight: { backgroundColor: '#CBD5E1' },
  activeDotDark: { backgroundColor: '#F8FAFC' },
  inactiveDotDark: { backgroundColor: '#475569' },
  
  facultyIdBox: { flexDirection: 'row', alignItems: 'center' },
  idLabel: { fontSize: 10, fontWeight: '700', color: '#1E2B4D', letterSpacing: 0.2 },
  idValue: { fontWeight: '900', color: '#1E2B4D' },
  copyBtn: { marginLeft: 8, padding: 6, borderRadius: 8, backgroundColor: '#FEF4E8' },
  copyBtnDark: { backgroundColor: '#332318' },

  // Quick Actions Section
  section: { paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 14.5, fontWeight: '900', color: '#0B132B', letterSpacing: 0.5 },
  allStatsBtn: { backgroundColor: '#FEF4E8', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, flexDirection: 'row', alignItems: 'center' },
  allStatsText: { color: '#D89B48', fontSize: 10, fontWeight: '900', marginRight: 4 },
  
  actionsGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  actionItem: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 20, paddingVertical: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: {width:0, height:6}, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 },
  actionItemDark: { backgroundColor: '#1E293B', shadowOpacity: 0 },
  actionIconWrapper: { marginBottom: 12 },
  actionLabel: { fontSize: 10.5, fontWeight: '900', color: '#0A1128', lineHeight: 13 },
  
  // Recent Latecomers Section
  tabsRow: { flexDirection: 'row', marginBottom: 15 },
  activeTab: { backgroundColor: '#FEF4E8', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, marginRight: 10 },
  activeTabText: { color: '#C16B30', fontSize: 10, fontWeight: '900', letterSpacing: 0.3 },
  inactiveTab: { paddingHorizontal: 10, paddingVertical: 8 },
  inactiveTabText: { color: '#93A1B5', fontSize: 10, fontWeight: '900' },
  
  activityScroll: { marginHorizontal: -20, paddingLeft: 20, paddingRight: 20 },
  activityCard: { width: 165, backgroundColor: '#FFFFFF', borderRadius: 22, padding: 20, marginRight: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: {width:0, height:4}, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  activityAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E5A653', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  activityAvatarText: { color: '#fff', fontSize: 20, fontWeight: '900' },
  activityName: { fontSize: 14, fontWeight: '900', color: '#0A1128', letterSpacing: -0.2, marginBottom: 2 },
  activityId: { fontSize: 10, fontWeight: 'bold', color: '#94A3B8', marginBottom: 2 },
  activityDept: { fontSize: 9.5, fontWeight: '900', color: '#3B82F6', marginBottom: 15 },
  activityDivider: { width: '100%', height: 1, backgroundColor: '#F1F5F9', marginBottom: 12 },
  activityFooter: { width: '100%', alignItems: 'center' },
  activityDate: { fontSize: 11, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
  activityStatusRow: { flexDirection: 'row', alignItems: 'center' },
  activityStatusText: { fontSize: 9, fontWeight: '900', color: '#76849D', marginLeft: 4, letterSpacing: 0.3 },
  
  // FAB & Bottom Nav
  fab: { position: 'absolute', bottom: 90, right: 20, backgroundColor: '#4A725D', paddingHorizontal: 18, paddingVertical: 14, borderRadius: 16, flexDirection: 'row', alignItems: 'center', shadowColor: '#4A725D', shadowOffset: {height: 6, width: 0}, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6, zIndex: 200 },
  fabText: { color: '#fff', fontSize: 13.5, fontWeight: '900', marginLeft: 8, letterSpacing: 0.5 },
  
  bottomNav: { position: 'absolute', bottom: 0, width: '100%', height: 75, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F1F5F9', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 50, zIndex: 150 },
  bottomNavDark: { backgroundColor: '#0F172A', borderTopColor: '#1E293B' },
  navItem: { alignItems: 'center', justifyContent: 'center' },
  navIconActive: { backgroundColor: '#FEF4E8', padding: 8, borderRadius: 14, marginBottom: 2 },
  navLabelActive: { fontSize: 9, fontWeight: '900', color: '#D89B48' },
  navLabelMuted: { fontSize: 9, fontWeight: '900', color: '#94A3B8', marginTop: 3 },
  navBadge: { position: 'absolute', top: -2, right: -4, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: '#fff', zIndex: 10 },

  borderDark: { borderColor: '#0F172A' },
  textWhite: { color: '#F8FAFC' },
  textDark: { color: '#94A3B8' },
  textDarkMuted: { color: '#64748B' }
});