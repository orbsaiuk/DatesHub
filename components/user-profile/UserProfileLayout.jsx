"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Settings,
  Bell,
  Shield,
  Bookmark,
  MessageSquare,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Edit,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

export function UserProfileLayout({ children }) {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState("overview");

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const role = user?.publicMetadata?.role || "user";
  const isBusiness = role === "company" || role === "supplier";
  const dashboardHref = isBusiness ? `/business/${role}/dashboard` : "#";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            الملف الشخصي
          </h1>
          <p className="text-gray-600">
            إدارة معلوماتك الشخصية وإعدادات الحساب
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-6">
                {/* Profile Info */}
                <div className="text-center mb-6">
                  <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarImage
                      src={user?.imageUrl}
                      alt={user?.fullName || "المستخدم"}
                    />
                    <AvatarFallback className="text-2xl">
                      {user?.firstName?.charAt(0) || "م"}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    {user?.fullName || "المستخدم"}
                  </h2>
                  <p className="text-gray-600 text-sm mb-3">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                  <Badge
                    variant={role === "user" ? "secondary" : "default"}
                    className="mb-4"
                  >
                    {role === "company"
                      ? "شركة"
                      : role === "supplier"
                        ? "مورد"
                        : "مستخدم"}
                  </Badge>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2 mb-6">
                  {isBusiness && (
                    <Link href={dashboardHref} className="block">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        لوحة التحكم
                      </Button>
                    </Link>
                  )}
                  <Link href="/bookmarks" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Bookmark className="w-4 h-4 mr-2" />
                      المحفوظات
                    </Button>
                  </Link>
                  <Link href="/messages" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      الرسائل
                    </Button>
                  </Link>
                </div>

                {/* Profile Stats */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    إحصائيات الحساب
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">تاريخ الانضمام:</span>
                      <span className="font-medium">
                        {user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("ar-SA")
                          : "غير محدد"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">آخر نشاط:</span>
                      <span className="font-medium">اليوم</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                <TabsTrigger value="personal">المعلومات الشخصية</TabsTrigger>
                <TabsTrigger value="preferences">التفضيلات</TabsTrigger>
                <TabsTrigger value="security">الأمان</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      نظرة عامة على الحساب
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          الاسم الكامل
                        </label>
                        <p className="text-gray-900">
                          {user?.fullName || "غير محدد"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          البريد الإلكتروني
                        </label>
                        <p className="text-gray-900">
                          {user?.primaryEmailAddress?.emailAddress ||
                            "غير محدد"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          رقم الهاتف
                        </label>
                        <p className="text-gray-900">
                          {user?.primaryPhoneNumber?.phoneNumber || "غير محدد"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          نوع الحساب
                        </label>
                        <p className="text-gray-900">
                          {role === "company"
                            ? "شركة"
                            : role === "supplier"
                              ? "مورد"
                              : "مستخدم عادي"}
                        </p>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4">
                        النشاط الأخير
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                          <div>
                            <p className="text-sm font-medium">
                              تم إنشاء الحساب بنجاح
                            </p>
                            <p className="text-xs text-gray-500">
                              {user?.createdAt
                                ? new Date(user.createdAt).toLocaleDateString(
                                    "ar-SA"
                                  )
                                : "غير محدد"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="personal" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      المعلومات الشخصية
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          <User className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium">الاسم الكامل</p>
                            <p className="text-sm text-gray-600">
                              {user?.fullName || "غير محدد"}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          تعديل
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          <Mail className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium">البريد الإلكتروني</p>
                            <p className="text-sm text-gray-600">
                              {user?.primaryEmailAddress?.emailAddress ||
                                "غير محدد"}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          تعديل
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          <Phone className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium">رقم الهاتف</p>
                            <p className="text-sm text-gray-600">
                              {user?.primaryPhoneNumber?.phoneNumber ||
                                "غير محدد"}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          تعديل
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preferences" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="w-5 h-5 mr-2" />
                      التفضيلات والإعدادات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          <Bell className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium">الإشعارات</p>
                            <p className="text-sm text-gray-600">
                              إدارة إعدادات الإشعارات
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4 mr-1" />
                          إعدادات
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium">الموقع</p>
                            <p className="text-sm text-gray-600">
                              إدارة موقعك الجغرافي
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4 mr-1" />
                          إعدادات
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      الأمان والخصوصية
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          <Shield className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium">كلمة المرور</p>
                            <p className="text-sm text-gray-600">
                              تغيير كلمة المرور
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          تغيير
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                          <div>
                            <p className="font-medium">المصادقة الثنائية</p>
                            <p className="text-sm text-gray-600">مفعلة</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4 mr-1" />
                          إدارة
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
