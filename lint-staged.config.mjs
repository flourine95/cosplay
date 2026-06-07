import path from "node:path"

const quote = (file) => `"${file.replaceAll('"', '\\"')}"`

const isGeneratedOrVendored = (file) => {
  const relativePath = path.relative(process.cwd(), file).replaceAll("\\", "/")

  return (
    relativePath.startsWith("components/ui/") ||
    relativePath.startsWith("app/generated/")
  )
}

const filterGeneratedOrVendored = (files) =>
  files.filter((file) => !isGeneratedOrVendored(file))

const lintStagedConfig = {
  "*.{ts,tsx}": (files) => {
    const lintableFiles = filterGeneratedOrVendored(files)

    if (lintableFiles.length === 0) {
      return []
    }

    const quotedFiles = lintableFiles.map(quote).join(" ")

    return [
      `eslint --max-warnings=0 --fix ${quotedFiles}`,
      `prettier --write ${quotedFiles}`,
    ]
  },
  "*.{json,css,md,yml,yaml}": "prettier --write",
}

export default lintStagedConfig
