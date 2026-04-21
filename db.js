/**
 * Majdoor.com — Supabase Database Wrapper
 * Migrated from LocalStorage to live Supabase PostgreSQL.
 */
const DB = {
  /**
   * Saves a new record to Supabase
   * @param {string} table - 'majdoors' or 'contractors'
   * @param {object} data - The record data
   */
  async save(table, data) {
    // Map JS camelCase to SQL snake_case where needed
    const payload = this._mapToDB(table, data);
    
    const { error } = await supabaseClient
      .from(table)
      .insert([payload]);

    if (error) {
      console.error(`Error saving to ${table}:`, error);
      throw error;
    }
  },

  /**
   * Gets all records from a table
   */
  async getAll(table) {
    const { data, error } = await supabaseClient
      .from(table)
      .select('*')
      .order('registered_at', { ascending: false });

    if (error) {
      console.error(`Error fetching from ${table}:`, error);
      return [];
    }

    // Map DB snake_case back to JS camelCase
    return data.map(row => this._mapFromDB(table, row));
  },

  /**
   * Updates a record in Supabase
   */
  async update(table, id, fields) {
    const payload = this._mapToDB(table, fields);
    
    const { error } = await supabaseClient
      .from(table)
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error(`Error updating ${table}:`, error);
      throw error;
    }
  },

  /**
   * Deletes a record from Supabase
   */
  async delete(table, id) {
    const { error } = await supabaseClient
      .from(table)
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting from ${table}:`, error);
      throw error;
    }
  },

  /**
   * Admin Config: Get password
   */
  async getAdminPassword() {
    const { data, error } = await supabaseClient
      .from('admin_config')
      .select('value')
      .eq('key', 'password')
      .single();

    if (error || !data) {
      console.warn('Admin config not found, falling back to default.');
      return 'admin123';
    }
    return data.value;
  },

  /**
   * Admin Config: Update password
   */
  async updateAdminPassword(newPassword) {
    const { error } = await supabaseClient
      .from('admin_config')
      .update({ value: newPassword })
      .eq('key', 'password');

    if (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  },

  /**
   * Analytics: Track a page visit
   */
  async trackVisit(pagePath) {
    try {
      await supabaseClient
        .from('website_analytics')
        .insert([{ page_path: pagePath || window.location.pathname }]);
    } catch (err) {
      console.warn('Analytics tracking failed:', err);
    }
  },

  /**
   * Analytics: Get total visits
   */
  async getAnalytics() {
    const { count, error } = await supabaseClient
      .from('website_analytics')
      .select('*', { count: 'exact', head: true });
    
    if (error) return 0;
    return count;
  },

  /**
   * Internal mapper: JS Object -> DB Row
   */
  _mapToDB(table, data) {
    const mapped = { ...data };
    if (table === 'majdoors') {
      if ('extraSkills' in data) { mapped.extra_skills = data.extraSkills; delete mapped.extraSkills; }
      if ('registeredAt' in data) { mapped.registered_at = new Date().toISOString(); delete mapped.registeredAt; }
      if ('lastCalledAt' in data) { mapped.last_called_at = data.lastCalledAt; delete mapped.lastCalledAt; }
    } else if (table === 'contractors') {
      if ('workType' in data) { mapped.work_type = data.workType; delete mapped.workType; }
      if ('workerCount' in data) { mapped.worker_count = data.workerCount; delete mapped.workerCount; }
      if ('startDate' in data) { mapped.start_date = data.startDate; delete mapped.startDate; }
      if ('adminNotes' in data) { mapped.admin_notes = data.adminNotes; delete mapped.adminNotes; }
      if ('registeredAt' in data) { mapped.registered_at = new Date().toISOString(); delete mapped.registeredAt; }
      if ('lastCalledAt' in data) { mapped.last_called_at = data.lastCalledAt; delete mapped.lastCalledAt; }
    }
    // Remove type field as it's not in DB
    delete mapped.type;
    return mapped;
  },

  /**
   * Internal mapper: DB Row -> JS Object
   */
  _mapFromDB(table, row) {
    const mapped = { ...row };
    if (table === 'majdoors') {
      mapped.extraSkills = row.extra_skills;
      mapped.registeredAt = new Date(row.registered_at).toLocaleString('en-IN');
      mapped.lastCalledAt = row.last_called_at;
      mapped.type = 'majdoor';
    } else if (table === 'contractors') {
      mapped.workType = row.work_type;
      mapped.workerCount = row.worker_count;
      mapped.startDate = row.start_date;
      mapped.adminNotes = row.admin_notes;
      mapped.registeredAt = new Date(row.registered_at).toLocaleString('en-IN');
      mapped.lastCalledAt = row.last_called_at;
      mapped.type = 'contractor';
    }
    return mapped;
  }
};
