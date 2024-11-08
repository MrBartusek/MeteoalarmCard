# `scaling_mode` configuration option

`scaling_mode` is the MeteoalarmCard configuration option introduced in version
[`v2.4.0`](https://github.com/MrBartusek/MeteoalarmCard/releases/tag/v2.4.0). Card scaling
is a module responsible for swapping headlines or reducing their size to ensure that whole
headline is always visible. `scaling_mode` option controls behaviour of said module.

![scaling demo](https://i.imgur.com/LqULkry.gif)

## Headline generator

While rendering the card, MeteoalarmCard prepares three headlines. For example:

- **Provided by integration**: Snowfall Warning
- **Long generated:** Yellow snow/ice warning
- **Short generated:** Snow/ice

The card then decided which headline to display at which size. When `override_headline` is enabled,
the first headline is omitted. Depending on the current width of the card and `scaling_mode`, the card will
try to swap these headlines, reduce their size, or both. This may cause you to see different
headlines on different devices.

## Available options

This option can be configured in four different ways.

### `headline_and_scale` (default)

```yaml
scaling_mode: headline_and_scale
```

The card will both use headline swapping and scaling. The card will try to find a headline that fits 
the current card size even when it means reducing its font size. This is the default configuration
option.

### `headline`

```yaml
scaling_mode: headline
```

The scaling module will try to find a headline that fits the current card size without changing
the headline font size. This is pre-2.4.0 behavior.


### `scale`

```yaml
scaling_mode: scale
```

The card will always use the first headline (provided by integration or long auto-generated) and
scale it to the current card size. When scaling hits a lower limit, the headline will be truncated
to fit.

### `disabled`

```yaml
scaling_mode: disabled
```

Scaling module is disabled. Card will always use first headline (provided
by integration or long auto-generated) and truncate it to fit.
