export function sanitizeFilename(name: string): string {
  return name.replace(/[\/\\?%*:|"<>]/g, "-").trim();
}

export function help() {
  console.log("Usage:");
  console.log(
    "   stchar-cli download <url> --json --image --locale={language}",
  );
}
