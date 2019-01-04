package net.altermundi.elrepoio;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.rnfs.RNFSPackage;
import net.altermundi.rn_handshake.HandshakePackage;
import net.altermundi.rn_nsd.NsdPackage;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import com.rngrp.RNGRPPackage;
import com.vinzscam.reactnativefileviewer.RNFileViewerPackage;
import com.reactnativedocumentpicker.ReactNativeDocumentPicker;
import com.oblador.vectoricons.VectorIconsPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import com.reactnativenavigation.NavigationApplication;
import com.reactnativenavigation.react.NavigationReactNativeHost;
import com.reactnativenavigation.react.ReactGateway;

import net.altermundi.elrepoio.nativemodules.RNRetroShareIntentPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends NavigationApplication  {
   
   @Override
   protected ReactGateway createReactGateway() {
       ReactNativeHost host = new NavigationReactNativeHost(this, isDebug(), createAdditionalReactPackages()) {
           @Override
           protected String getJSMainModuleName() {
               return "index";
           }
       };
       return new ReactGateway(this, isDebug(), host);
   }

   @Override
   public boolean isDebug() {
       return BuildConfig.DEBUG;
   }

   protected List<ReactPackage> getPackages() {
       // Add additional packages you require here
       // No need to add RnnPackage and MainReactPackage
       return Arrays.<ReactPackage>asList(
           new RNFSPackage(),
           new HandshakePackage(),
           new NsdPackage(),
           new PickerPackage(),
           new RNGRPPackage(),
           new RNFileViewerPackage(),
           new ReactNativeDocumentPicker(),
           new VectorIconsPackage(),
           new RNRetroShareIntentPackage()
           // eg. new VectorIconsPackage()
       );
   }
 
   @Override
   public List<ReactPackage> createAdditionalReactPackages() {
       return getPackages();
   }

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage()          
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}