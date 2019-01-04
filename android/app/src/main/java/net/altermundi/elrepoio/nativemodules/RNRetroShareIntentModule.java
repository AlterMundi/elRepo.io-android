package net.altermundi.elrepoio.nativemodules;

import android.content.Intent;
import android.content.Context; 

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;


public class RNRetroShareIntentModule extends ReactContextBaseJavaModule {

    private static final String PROMISE_ERROR = "Error";
    private ReactApplicationContext reactContext;

    public RNRetroShareIntentModule(ReactApplicationContext reactContext) {
      super(reactContext);
      this.reactContext = reactContext;
    }

    @Override
    public String getName() {
      return "RetroShareIntent";
    }

    @ReactMethod
    public void  startService(final Promise promise) {
        Intent i= new Intent();
        i.setClassName("org.retroshare.service", "org.retroshare.service.RetroShareServiceAndroid");
        if( this.reactContext.startService(i) == null) {
            promise.reject(null,  PROMISE_ERROR);
        } else {
            promise.resolve(null);
        }
    }

    @ReactMethod
    public void stopService(final Promise promise) {
        Intent i= new Intent();
        i.setClassName("org.retroshare.service", "org.retroshare.service.RetroShareServiceAndroid");
        if( this.reactContext.stopService(i) == false ) {
            promise.reject(null,  PROMISE_ERROR);
        } else {
            promise.resolve(null);
        }
    }

}