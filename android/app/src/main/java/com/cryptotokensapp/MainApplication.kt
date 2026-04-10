package com.cryptotokensapp

import android.app.Application
import android.content.res.Configuration
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader

class MainApplication : Application(), ReactApplication {
  private val mReactNativeHost = object : DefaultReactNativeHost(this) {
    override fun getUseDeveloperSupport(): Boolean = true

    override fun getPackages(): MutableList<ReactPackage> = mutableListOf()
  }

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, false)
    DefaultNewArchitectureEntryPoint.load()
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    mReactNativeHost.reactInstanceManager.onConfigurationChanged(this, newConfig)
  }
}
