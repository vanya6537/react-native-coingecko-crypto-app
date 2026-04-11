// Temporarily reduced PackageList - problematic libraries excluded
// Gesture-handler, Reanimated, Nitro,  Worklets have C++ codegen incompatibilities
// These can be re-enabled once library versions are updated

package com.facebook.react;

import android.app.Application;
import android.content.Context;
import android.content.res.Resources;

import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainPackageConfig;
import com.facebook.react.shell.MainReactPackage;
import java.util.Arrays;
import java.util.ArrayList;

@SuppressWarnings("deprecation")
public class PackageList {
  private Application application;
  private ReactNativeHost reactNativeHost;
  private MainPackageConfig mConfig;

  public PackageList(ReactNativeHost reactNativeHost) {
    this(reactNativeHost, null);
  }

  public PackageList(Application application) {
    this(application, null);
  }

  public PackageList(ReactNativeHost reactNativeHost, MainPackageConfig config) {
    this.reactNativeHost = reactNativeHost;
    mConfig = config;
  }

  public PackageList(Application application, MainPackageConfig config) {
    this.reactNativeHost = null;
    this.application = application;
    mConfig = config;
  }

  private ReactNativeHost getReactNativeHost() {
    return this.reactNativeHost;
  }

  private Resources getResources() {
    return this.getApplication().getResources();
  }

  private Application getApplication() {
    if (this.reactNativeHost == null) return this.application;
    return this.reactNativeHost.getApplication();
  }

  private Context getApplicationContext() {
    return this.getApplication().getApplicationContext();
  }

  public ArrayList<ReactPackage> getPackages() {
    return new ArrayList<>(Arrays.<ReactPackage>asList(
      new MainReactPackage(mConfig),
      // TEMP: Excluded problematic packages with C++ codegen issues
      // new com.swmansion.gesturehandler.RNGestureHandlerPackage(),
      // new com.swmansion.reanimated.ReanimatedPackage(),
      new com.margelo.nitro.mmkv.NitroMmkvPackage(),
      // new com.margelo.nitro.NitroModulesPackage(),
      new com.th3rdwave.safeareacontext.SafeAreaContextPackage(),
      new com.swmansion.rnscreens.RNScreensPackage(),
      new com.horcrux.svg.SvgPackage()
      // new com.swmansion.worklets.WorkletsPackage()
    ));
  }
}
