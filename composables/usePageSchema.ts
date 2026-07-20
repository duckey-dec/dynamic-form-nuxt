/**
 * usePageSchema
 * -------------
 * Fetches a page (e.g. a blog post) from the live boom.yugme.com
 * page-builder API. Each item in `page.components` looks like:
 *
 *   {
 *     id, position,
 *     data: { ...actual values... },
 *     definition: {
 *       name, slug,
 *       fields: [
 *         { key, type, label, required, max_length, children?: [...] }
 *       ],
 *       validation_rules: {...}
 *     }
 *   }
 *
 * `type: "array"` fields always carry a `children` array describing the
 * shape of each row (this is what lets the form behave like a shopping
 * cart — add/remove repeatable rows made of sub-fields).
 */
export interface FieldDef {
  key: string
  type: string
  label?: string
  required?: boolean
  max_length?: number | null
  children?: FieldDef[]
}

export interface ComponentDef {
  id: number
  name: string
  slug: string
  fields: FieldDef[]
  validation_rules?: Record<string, string>
}

export interface PageComponent {
  id: number
  position: number
  data: Record<string, any>
  definition: ComponentDef
}

export interface BlogPage {
  id: number
  title: string
  slug: string
  components: PageComponent[]
}

export function usePageSchema() {
  const config = useRuntimeConfig()

  const page = ref<BlogPage | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchPage(endpoint: string, slug: string) {
    loading.value = true
    error.value = null
    try {
      const url = `${config.public.apiBase}/${endpoint}/${slug}`
      const res: any = await $fetch(url)
      if (!res?.success || !res?.data?.page) {
        throw new Error(res?.message || 'Unexpected API response shape')
      }
      page.value = res.data.page
      return res.data.page as BlogPage
    } catch (e: any) {
      error.value = e?.message || 'Failed to fetch page'
      throw e
    } finally {
      loading.value = false
    }
  }

  /** Build an empty value matching a field's shape (used for "Add row"). */
  function emptyValueFor(field: FieldDef): any {
    if (field.type === 'array') {
      return []
    }
    if (field.type === 'boolean') {
      return false
    }
    return ''
  }

  /** Build an empty "row" object for an array field's children definition. */
  function emptyRowFor(children: FieldDef[]): Record<string, any> {
    const row: Record<string, any> = {}
    for (const child of children) {
      row[child.key] = emptyValueFor(child)
    }
    return row
  }

  /** Serialize the current page back into a blog.json-shaped payload. */
  function toBlogJson(): any {
    if (!page.value) return null
    return {
      success: true,
      message: 'Page fetched successfully',
      data: {
        page: {
          id: page.value.id,
          title: page.value.title,
          slug: page.value.slug,
          components: page.value.components.map((c) => ({
            id: c.id,
            position: c.position,
            data: c.data,
            definition: c.definition
          }))
        }
      }
    }
  }

  return { page, loading, error, fetchPage, emptyValueFor, emptyRowFor, toBlogJson }
}
