export const parseSnakeCaseToTitleCase = (s: string): string =>
  s.replace(/^_*(.)|_+(.)/g, (_s, c, d) =>
    c ? c.toUpperCase() : " " + d.toUpperCase(),
  );

export const trimCodeFormat = (s: string): string =>
  s.replace(/```.*\n|\n```/g, "");
