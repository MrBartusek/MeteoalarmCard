# `scaling_mode` configuration option

`scaling_mode` is the MeteoalarmCard configuration option introduced in version
[`v2.4.0`](https://github.com/MrBartusek/MeteoalarmCard/releases/tag/v2.4.0). Card scaling
is a module responsible for swapping headlines or reducing their size to ensure that whol
headline is always visible. `scaling_mode` option controls bechavior of said module.

![scaling demo](https://i.imgur.com/LqULkry.gif)

## Headline generator

While rendering card, MeteoalarmCard prepares three headlines. For example:

- **Provided by integration**: Snowfall Warning
- **Long generated:** Yellow snow/ice warning
- **Short generated:** Snow/ice

Card then decided which headline at which size to display. When `override_headline` is enabled,
the first headline is ommited. Depending on current width of the card and `scaling_mode`, card will
try to swap these headlines, reduce thier size, or both. This may cause that you will see diffrent
headlines on diffrent devices.

## Available options

This option can be configured in four diffrent ways.

### `headline_and_scale` (default)

```yaml
scaling_mode: headline_and_scale
```

Card will both use headline swaping and scaling. Card will try to find a headline that fits on
the current card size even when it means reducing it's font size. This is default configuration
option.

### `headline`

```yaml
scaling_mode: headline
```

Scaling module will try to find a headline that fits on the current card size without changing
headline font size. This is pre-2.4.0 behavior.


### `scale`

```yaml
scaling_mode: scale
```

Card will always use first headline (provided by integration or long auto-generated) and
scale it to the current card size. When scaling hits lower limit, headline will be truncated
to fit.

### `disabled`

```yaml
scaling_mode: disabled
```

Scaling module is disabled. Card will always use first headline (provided
by integration or long auto-generated) and truncate it to fit.
