import React from 'react';
import { Tabs } from 'expo-router';
import { Colors } from '../../constants/Styles';
import { LayoutDashboard, CalendarRange, UserCircle, MapPin } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

export default function TabLayout() {
  const { role } = useAuth();
  const isManager = role === 'manager';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.muted,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: Colors.surface,
        },
        headerTitleStyle: {
          fontWeight: '700',
          color: Colors.secondary,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="courts"
        options={{
          title: 'Manage',
          href: isManager ? '/courts' : null,
          tabBarIcon: ({ color }) => <MapPin size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="book"
        options={{
          title: 'Book',
          href: !isManager ? '/book' : null,
          tabBarIcon: ({ color }) => <CalendarRange size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <UserCircle size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
