package com.vibecontrol.app;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.BatteryManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.SeekBar;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class MainActivity extends Activity {

    private static final String[] PATTERN_NAMES = {
            "Constant", "Pulse", "Heartbeat", "SOS", "Ramp up", "Custom"
    };

    // Each pattern is {durationMs, relativeAmplitude(0-100)} pairs; amplitude 0 = pause.
    private static final int[][][] PATTERNS = {
            {{1000, 100}},
            {{200, 100}, {200, 0}},
            {{100, 100}, {100, 0}, {100, 100}, {700, 0}},
            {{150, 100}, {150, 0}, {150, 100}, {150, 0}, {150, 100}, {400, 0},
                    {400, 100}, {150, 0}, {400, 100}, {150, 0}, {400, 100}, {400, 0},
                    {150, 100}, {150, 0}, {150, 100}, {150, 0}, {150, 100}, {900, 0}},
            {{300, 20}, {300, 40}, {300, 60}, {300, 80}, {300, 100}, {500, 0}},
            {},
    };

    private final Handler handler = new Handler(Looper.getMainLooper());
    private Vibrator vibrator;

    private SeekBar strength;
    private TextView strengthLabel, capability, batteryInfo;
    private Spinner patternSpinner;
    private EditText custom;
    private CheckBox repeat;
    private ProgressBar batteryBar;

    // Fallback discharge-rate tracking (level samples).
    private int trackLevel = -1;
    private long trackTime;
    private double msPerPercent = -1;

    private final Runnable batteryTick = new Runnable() {
        @Override
        public void run() {
            updateBattery();
            handler.postDelayed(this, 5000);
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            VibratorManager vm = (VibratorManager) getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
            vibrator = vm.getDefaultVibrator();
        } else {
            vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
        }

        strength = findViewById(R.id.strength);
        strengthLabel = findViewById(R.id.strengthLabel);
        capability = findViewById(R.id.capability);
        batteryInfo = findViewById(R.id.batteryInfo);
        batteryBar = findViewById(R.id.batteryBar);
        patternSpinner = findViewById(R.id.pattern);
        custom = findViewById(R.id.custom);
        repeat = findViewById(R.id.repeat);

        patternSpinner.setAdapter(new ArrayAdapter<>(this,
                android.R.layout.simple_spinner_dropdown_item, PATTERN_NAMES));
        patternSpinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> p, View v, int pos, long id) {
                custom.setVisibility(pos == PATTERN_NAMES.length - 1 ? View.VISIBLE : View.GONE);
            }

            @Override
            public void onNothingSelected(AdapterView<?> p) {
            }
        });

        strength.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar s, int progress, boolean fromUser) {
                updateStrengthLabel();
            }

            @Override
            public void onStartTrackingTouch(SeekBar s) {
            }

            @Override
            public void onStopTrackingTouch(SeekBar s) {
            }
        });
        updateStrengthLabel();

        if (!vibrator.hasVibrator()) {
            capability.setText("This device has no vibration motor.");
        } else if (!vibrator.hasAmplitudeControl()) {
            capability.setText("Note: this phone cannot vary vibration strength; "
                    + "strength is ignored and patterns are on/off only.");
        } else {
            capability.setText("Strength control supported.");
        }

        ((Button) findViewById(R.id.start)).setOnClickListener(v -> start());
        ((Button) findViewById(R.id.stop)).setOnClickListener(v -> vibrator.cancel());
    }

    private void updateStrengthLabel() {
        strengthLabel.setText(String.format(Locale.US, "%d%%", Math.max(1, strength.getProgress())));
    }

    private void start() {
        if (!vibrator.hasVibrator()) {
            return;
        }
        int[][] segments = PATTERNS[patternSpinner.getSelectedItemPosition()];
        List<int[]> list = new ArrayList<>();
        if (segments.length == 0) {
            String[] parts = custom.getText().toString().split("[,\\s]+");
            for (int i = 0; i < parts.length; i++) {
                try {
                    int ms = Integer.parseInt(parts[i].trim());
                    if (ms <= 0) continue;
                    list.add(new int[]{ms, i % 2 == 0 ? 100 : 0});
                } catch (NumberFormatException e) {
                    Toast.makeText(this, "Custom pattern must be numbers in ms", Toast.LENGTH_SHORT).show();
                    return;
                }
            }
        } else {
            for (int[] s : segments) list.add(s);
        }
        if (list.isEmpty()) {
            Toast.makeText(this, "Pattern is empty", Toast.LENGTH_SHORT).show();
            return;
        }

        int level = Math.max(1, Math.round(255f * strength.getProgress() / 100f));
        long[] timings = new long[list.size()];
        int[] amps = new int[list.size()];
        for (int i = 0; i < list.size(); i++) {
            timings[i] = list.get(i)[0];
            amps[i] = list.get(i)[1] == 0 ? 0 : Math.max(1, Math.round(level * list.get(i)[1] / 100f));
        }

        vibrator.cancel();
        int repeatIndex = repeat.isChecked() ? 0 : -1;
        if (vibrator.hasAmplitudeControl()) {
            vibrator.vibrate(VibrationEffect.createWaveform(timings, amps, repeatIndex));
        } else {
            vibrator.vibrate(VibrationEffect.createWaveform(timings, repeatIndex));
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        handler.post(batteryTick);
    }

    @Override
    protected void onPause() {
        super.onPause();
        handler.removeCallbacks(batteryTick);
    }

    private void updateBattery() {
        Intent i = registerReceiver(null, new IntentFilter(Intent.ACTION_BATTERY_CHANGED));
        BatteryManager bm = (BatteryManager) getSystemService(Context.BATTERY_SERVICE);
        if (i == null) return;

        int level = i.getIntExtra(BatteryManager.EXTRA_LEVEL, -1);
        int scale = i.getIntExtra(BatteryManager.EXTRA_SCALE, 100);
        int status = i.getIntExtra(BatteryManager.EXTRA_STATUS, -1);
        int pct = Math.round(100f * level / scale);
        boolean charging = status == BatteryManager.BATTERY_STATUS_CHARGING;
        boolean full = status == BatteryManager.BATTERY_STATUS_FULL;
        batteryBar.setProgress(pct);

        long now = SystemClock.elapsedRealtime();
        if (trackLevel < 0 || charging || pct > trackLevel) {
            trackLevel = pct;
            trackTime = now;
        } else if (pct < trackLevel) {
            msPerPercent = (now - trackTime) / (double) (trackLevel - pct);
            trackLevel = pct;
            trackTime = now;
        }

        String remaining;
        if (full) {
            remaining = "Fully charged";
        } else if (charging) {
            long ms = Build.VERSION.SDK_INT >= Build.VERSION_CODES.P ? bm.computeChargeTimeRemaining() : -1;
            remaining = ms > 0 ? "Time to full: " + fmt(ms) : "Charging (time to full unknown)";
        } else {
            long ms = estimateDischargeMs(bm, pct);
            remaining = ms > 0 ? "Time remaining: ~" + fmt(ms) : "Time remaining: measuring...";
        }
        batteryInfo.setText(String.format(Locale.US, "%d%%\n%s", pct, remaining));
    }

    private long estimateDischargeMs(BatteryManager bm, int pct) {
        // Preferred: remaining charge / present current draw.
        long counter = bm.getLongProperty(BatteryManager.BATTERY_PROPERTY_CHARGE_COUNTER);
        long current = Math.abs(bm.getLongProperty(BatteryManager.BATTERY_PROPERTY_CURRENT_NOW));
        if (counter > 0 && current > 0) {
            // Units differ by device (uAh/uA vs mAh/mA); the ratio is hours either way if consistent.
            double hours = counter / (double) current;
            if (hours >= 0.2 && hours <= 200) {
                return (long) (hours * 3600_000L);
            }
        }
        // Fallback: observed drain rate.
        if (msPerPercent > 0) {
            return (long) (msPerPercent * pct);
        }
        return -1;
    }

    private static String fmt(long ms) {
        long mins = ms / 60000;
        return String.format(Locale.US, "%dh %02dm", mins / 60, mins % 60);
    }
}
