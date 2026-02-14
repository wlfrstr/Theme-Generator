/**
 * Default theme structures. Used as base and filled from CSS analysis.
 */

function valueHex(hex) {
  return { value: hex, unit: 'hex' };
}
function valuePx(n) {
  return { value: n, unit: 'px' };
}
function valuePercent(n) {
  return { value: n, unit: '%' };
}

export const baseThemeLight = {
  color_primary: valueHex('#7379FD'),
  color_error: valueHex('#F04B38'),
  background_color: valueHex('#FFFFFF'),
  font_color_body: valueHex('#313131'),
  font_color_small: valueHex('#848484'),
  font_color_heading: valueHex('#313131'),
  font_color_input_value_disabled: null,
  font_color_input_placeholder: null,
  font_color_input_input_label: null,
  font_family_body: 'ABC Monument Grotesk',
  font_family_small: 'ABC Monument Grotesk',
  font_family_heading: 'ABC Monument Grotesk',
  font_size_body: valuePx(18),
  font_size_small: valuePx(12),
  font_size_heading: valuePx(28),
  font_size_input_label: null,
  font_weight_body: null,
  font_weight_small: null,
  font_weight_heading: null,
  font_line_height_body: valuePx(22),
  font_line_height_small: valuePx(12),
  font_line_height_heading: valuePx(32),
  font_justify_body: null,
  font_justify_small: null,
  font_justify_heading: null,
  button_font_weight: 'normal',
  button_border_radius: valuePx(30),
  button_primary_border_width: valuePx(0),
  button_secondary_border_width: valuePx(0),
  button_shadow_strength: null,
  button_text_transform: null,
  button_primary_background_color: valueHex('#313131'),
  button_primary_background_color_disabled: valueHex('#BDBDBD'),
  button_primary_font_color: valueHex('#FFFFFF'),
  button_primary_border_color: valueHex('#313131'),
  button_primary_size: { x: valuePercent(100), y: valuePx(48) },
  button_secondary_background_color: valueHex('#F1F1F2'),
  button_secondary_background_color_disabled: valueHex('#F1F1F2'),
  button_secondary_font_color: valueHex('#313131'),
  button_secondary_border_color: valueHex('#313131'),
  button_secondary_size: { x: valuePercent(100), y: valuePx(48) },
  link_font_color: valueHex('#3F48FD'),
  input_background_color: valueHex('#FFFFFF'),
  input_border_color: valueHex('#DBDBDB'),
  input_border_radius: valuePx(4),
  input_border_width: {
    top: valuePx(1),
    bottom: valuePx(1),
    left: valuePx(1),
    right: valuePx(1),
  },
  input_font_color: null,
  icon_color_primary: valueHex('#7379FD'),
  icon_color_stroke: valueHex('#02099C'),
  icon_color_highlight: valueHex('#A7ABFE'),
  icon_color_background: valueHex('#FFFFFF'),
  tooltip_font_color: null,
  tooltip_background_color: null,
  tooltip_border_color: null,
  option_background_color_focused: null,
  select_option_background_color_focused: null,
};

export const baseThemeDark = {
  ...baseThemeLight,
  background_color: valueHex('#313131'),
  font_color_body: valueHex('#E2E2E3'),
  font_color_small: valueHex('#E2E2E3'),
  font_color_heading: valueHex('#FFFFFF'),
  button_primary_background_color: valueHex('#E2E2E3'),
  button_primary_background_color_disabled: valueHex('#A0A0A0'),
  button_primary_font_color: valueHex('#313131'),
  button_primary_border_color: valueHex('#E2E2E3'),
  button_primary_size: { x: null, y: valuePx(48) },
  button_secondary_background_color: valueHex('#565656'),
  button_secondary_background_color_disabled: valueHex('#434343'),
  button_secondary_font_color: valueHex('#FFFFFF'),
  button_secondary_border_color: valueHex('#565656'),
  button_secondary_size: { x: null, y: valuePx(48) },
  link_font_color: valueHex('#A7ABFE'),
  input_background_color: valueHex('#313131'),
  input_border_color: valueHex('#A0A0A0'),
  icon_color_background: valueHex('#E2E2E3'),
};

export const inquiryThemeLight = {
  navbar_icon_color: valueHex('#313131'),
  navbar_background_color: null,
  navbar_logo_height: null,
  icon_success_primary_color: valueHex('#22966B'),
  modal_border_radius: valuePx(24),
  logo: null,
  hosted_flow_background_color: null,
  hosted_flow_frame_border_color: null,
  hosted_flow_frame_border_width: null,
  navbar_logo_display: 'center',
  step_assets: null,
};

export const inquiryThemeDark = {
  ...inquiryThemeLight,
  navbar_icon_color: valueHex('#FFFFFF'),
};
