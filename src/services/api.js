import { supabase } from '@/lib/supabaseClient';

// ============================================
// AUTH FUNCTIONS
// ============================================

export const auth = {
    // Sign up with email and password
    signUp: async (email, password, fullName) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName }
            }
        });
        if (error) throw error;
        return data;
    },

    // Sign in with email and password
    signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        return data;
    },

    // Sign out
    signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    // Get current session
    getSession: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    },

    // Get current user
    getUser: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    // Subscribe to auth changes
    onAuthStateChange: (callback) => {
        return supabase.auth.onAuthStateChange(callback);
    }
};

// ============================================
// PROFILE FUNCTIONS
// ============================================

export const profiles = {
    get: async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .single();
        if (error) throw error;
        return data;
    },

    update: async (updates) => {
        const user = await auth.getUser();
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();
        if (error) throw error;
        return data;
    }
};

// ============================================
// BABIES FUNCTIONS
// ============================================

export const babies = {
    list: async () => {
        const { data, error } = await supabase
            .from('babies')
            .select('*')
            .is('deleted_at', null)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    get: async (id) => {
        const { data, error } = await supabase
            .from('babies')
            .select('*')
            .eq('id', id)
            .is('deleted_at', null)
            .single();
        if (error) throw error;
        return data;
    },

    // Get the first baby for current user (for compatibility)
    getFirst: async () => {
        const { data, error } = await supabase
            .from('babies')
            .select('*')
            .is('deleted_at', null)
            .order('created_at', { ascending: true })
            .limit(1)
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    create: async (baby) => {
        const user = await auth.getUser();
        const { data, error } = await supabase
            .from('babies')
            .insert({ ...baby, owner_id: user.id })
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    update: async (id, updates) => {
        const { data, error } = await supabase
            .from('babies')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    delete: async (id) => {
        // Soft delete
        const { error } = await supabase
            .from('babies')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);
        if (error) throw error;
    }
};

// ============================================
// FAMILY MEMBERS FUNCTIONS
// ============================================

export const familyMembers = {
    list: async (babyId) => {
        const { data, error } = await supabase
            .from('family_members')
            .select('*')
            .eq('baby_id', babyId)
            .order('relationship');
        if (error) throw error;
        return data;
    },

    create: async (member) => {
        const { data, error } = await supabase
            .from('family_members')
            .insert(member)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    update: async (id, updates) => {
        const { data, error } = await supabase
            .from('family_members')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    delete: async (id) => {
        const { error } = await supabase
            .from('family_members')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
};

// ============================================
// GROWTH RECORDS FUNCTIONS
// ============================================

export const growthRecords = {
    list: async (babyId) => {
        const { data, error } = await supabase
            .from('growth_records')
            .select('*')
            .eq('baby_id', babyId)
            .order('recorded_date', { ascending: false });
        if (error) throw error;
        return data;
    },

    create: async (record) => {
        const { data, error } = await supabase
            .from('growth_records')
            .insert(record)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    update: async (id, updates) => {
        const { data, error } = await supabase
            .from('growth_records')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    delete: async (id) => {
        const { error } = await supabase
            .from('growth_records')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
};

// ============================================
// VACCINES FUNCTIONS
// ============================================

export const vaccines = {
    list: async (babyId) => {
        const { data, error } = await supabase
            .from('vaccines')
            .select('*')
            .eq('baby_id', babyId)
            .order('scheduled_date', { ascending: true });
        if (error) throw error;
        return data;
    },

    create: async (vaccine) => {
        const { data, error } = await supabase
            .from('vaccines')
            .insert(vaccine)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    update: async (id, updates) => {
        const { data, error } = await supabase
            .from('vaccines')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    delete: async (id) => {
        const { error } = await supabase
            .from('vaccines')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
};

// ============================================
// MEDICATIONS FUNCTIONS
// ============================================

export const medications = {
    list: async (babyId, activeOnly = true) => {
        let query = supabase
            .from('medications')
            .select('*')
            .eq('baby_id', babyId);

        if (activeOnly) {
            query = query.eq('is_active', true);
        }

        const { data, error } = await query.order('name');
        if (error) throw error;
        return data;
    },

    create: async (medication) => {
        const { data, error } = await supabase
            .from('medications')
            .insert(medication)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    update: async (id, updates) => {
        const { data, error } = await supabase
            .from('medications')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    delete: async (id) => {
        const { error } = await supabase
            .from('medications')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // Log medication administration
    logAdministration: async (medicationId, administeredBy, notes) => {
        const { data, error } = await supabase
            .from('medication_logs')
            .insert({
                medication_id: medicationId,
                administered_by: administeredBy,
                notes
            })
            .select()
            .single();
        if (error) throw error;
        return data;
    }
};

// ============================================
// APPOINTMENTS FUNCTIONS
// ============================================

export const appointments = {
    list: async (babyId, status = null) => {
        let query = supabase
            .from('appointments')
            .select('*')
            .eq('baby_id', babyId);

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query.order('scheduled_at', { ascending: true });
        if (error) throw error;
        return data;
    },

    create: async (appointment) => {
        const { data, error } = await supabase
            .from('appointments')
            .insert(appointment)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    update: async (id, updates) => {
        const { data, error } = await supabase
            .from('appointments')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    delete: async (id) => {
        const { error } = await supabase
            .from('appointments')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
};

// ============================================
// FEEDING RECORDS FUNCTIONS
// ============================================

export const feedingRecords = {
    list: async (babyId, limit = 50) => {
        const { data, error } = await supabase
            .from('feeding_records')
            .select('*')
            .eq('baby_id', babyId)
            .order('started_at', { ascending: false })
            .limit(limit);
        if (error) throw error;
        return data;
    },

    create: async (record) => {
        const { data, error } = await supabase
            .from('feeding_records')
            .insert(record)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    update: async (id, updates) => {
        const { data, error } = await supabase
            .from('feeding_records')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    delete: async (id) => {
        const { error } = await supabase
            .from('feeding_records')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
};

// ============================================
// SLEEP RECORDS FUNCTIONS
// ============================================

export const sleepRecords = {
    list: async (babyId, limit = 50) => {
        const { data, error } = await supabase
            .from('sleep_records')
            .select('*')
            .eq('baby_id', babyId)
            .order('started_at', { ascending: false })
            .limit(limit);
        if (error) throw error;
        return data;
    },

    create: async (record) => {
        const { data, error } = await supabase
            .from('sleep_records')
            .insert(record)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    update: async (id, updates) => {
        const { data, error } = await supabase
            .from('sleep_records')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    delete: async (id) => {
        const { error } = await supabase
            .from('sleep_records')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
};

// ============================================
// DIAPER RECORDS FUNCTIONS
// ============================================

export const diaperRecords = {
    list: async (babyId, limit = 50) => {
        const { data, error } = await supabase
            .from('diaper_records')
            .select('*')
            .eq('baby_id', babyId)
            .order('recorded_at', { ascending: false })
            .limit(limit);
        if (error) throw error;
        return data;
    },

    create: async (record) => {
        const { data, error } = await supabase
            .from('diaper_records')
            .insert(record)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    delete: async (id) => {
        const { error } = await supabase
            .from('diaper_records')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
};

// ============================================
// MILESTONES FUNCTIONS
// ============================================

export const milestones = {
    list: async (babyId) => {
        const { data, error } = await supabase
            .from('milestones')
            .select('*')
            .eq('baby_id', babyId)
            .order('achieved_date', { ascending: false, nullsFirst: false });
        if (error) throw error;
        return data;
    },

    create: async (milestone) => {
        const { data, error } = await supabase
            .from('milestones')
            .insert(milestone)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    update: async (id, updates) => {
        const { data, error } = await supabase
            .from('milestones')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    delete: async (id) => {
        const { error } = await supabase
            .from('milestones')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
};

// ============================================
// DOCUMENTS FUNCTIONS
// ============================================

export const documents = {
    list: async (babyId) => {
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .eq('baby_id', babyId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    create: async (doc) => {
        const { data, error } = await supabase
            .from('documents')
            .insert(doc)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    update: async (id, updates) => {
        const { data, error } = await supabase
            .from('documents')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    delete: async (id) => {
        // Soft delete
        const { error } = await supabase
            .from('documents')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);
        if (error) throw error;
    }
};

// ============================================
// GALLERY FUNCTIONS
// ============================================

export const gallery = {
    list: async (babyId) => {
        const { data, error } = await supabase
            .from('gallery')
            .select('*')
            .eq('baby_id', babyId)
            .is('deleted_at', null)
            .order('photo_date', { ascending: false, nullsFirst: false });
        if (error) throw error;
        return data;
    },

    create: async (item) => {
        const { data, error } = await supabase
            .from('gallery')
            .insert(item)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    update: async (id, updates) => {
        const { data, error } = await supabase
            .from('gallery')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    delete: async (id) => {
        // Soft delete
        const { error } = await supabase
            .from('gallery')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);
        if (error) throw error;
    },

    toggleFavorite: async (id, isFavorite) => {
        const { data, error } = await supabase
            .from('gallery')
            .update({ is_favorite: isFavorite })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    }
};

// ============================================
// STORAGE FUNCTIONS
// ============================================

export const storage = {
    // Upload avatar
    uploadAvatar: async (file) => {
        const user = await auth.getUser();
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/avatar.${fileExt}`;

        const { data, error } = await supabase.storage
            .from('avatars')
            .upload(fileName, file, { upsert: true });
        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);

        return publicUrl;
    },

    // Upload baby photo
    uploadBabyPhoto: async (babyId, file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${babyId}/${Date.now()}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from('baby-photos')
            .upload(fileName, file);
        if (error) throw error;

        return data.path;
    },

    // Get signed URL for baby photo
    getBabyPhotoUrl: async (path) => {
        const { data, error } = await supabase.storage
            .from('baby-photos')
            .createSignedUrl(path, 3600); // 1 hour expiry
        if (error) throw error;
        return data.signedUrl;
    },

    // Upload document
    uploadDocument: async (babyId, file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${babyId}/${Date.now()}-${file.name}`;

        const { data, error } = await supabase.storage
            .from('documents')
            .upload(fileName, file);
        if (error) throw error;

        return data.path;
    },

    // Get signed URL for document
    getDocumentUrl: async (path) => {
        const { data, error } = await supabase.storage
            .from('documents')
            .createSignedUrl(path, 3600);
        if (error) throw error;
        return data.signedUrl;
    },

    // Delete file from storage
    deleteFile: async (bucket, path) => {
        const { error } = await supabase.storage
            .from(bucket)
            .remove([path]);
        if (error) throw error;
    }
};

// ============================================
// LEGACY API COMPATIBILITY LAYER
// ============================================
// This provides backwards compatibility with the old api.js interface

export const api = {
    // Auth (legacy interface)
    login: async (email, password) => {
        const data = await auth.signIn(email, password);
        return { token: data.session?.access_token, user: data.user };
    },

    register: async ({ email, password, name }) => {
        return await auth.signUp(email, password, name);
    },

    logout: async () => {
        await auth.signOut();
    },

    // Baby (legacy interface)
    getBaby: async () => {
        const baby = await babies.getFirst();
        if (!baby) {
            // Auto-create first baby for new user
            const user = await auth.getUser();
            return await babies.create({ name: 'Meu Bebê' });
        }
        return baby;
    },

    // Events (legacy interface - maps to specific tables)
    getEvents: async (babyId) => {
        // Combine different event types for timeline
        const [vaccinesList, medicationsList, appointmentsList, milestonesList] = await Promise.all([
            vaccines.list(babyId),
            medications.list(babyId, false),
            appointments.list(babyId),
            milestones.list(babyId)
        ]);

        const events = [
            ...vaccinesList.map(v => ({ ...v, type: 'vaccine', date: v.scheduled_date })),
            ...medicationsList.map(m => ({ ...m, type: 'medication', date: m.start_date })),
            ...appointmentsList.map(a => ({ ...a, type: 'appointment', date: a.scheduled_at })),
            ...milestonesList.map(m => ({ ...m, type: 'milestone', date: m.achieved_date }))
        ];

        return events.sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    // Documents (legacy interface)
    uploadDocument: async (formData) => {
        const file = formData.get('file');
        const babyId = formData.get('babyId');
        const title = formData.get('title');
        const type = formData.get('type');

        const filePath = await storage.uploadDocument(babyId, file);
        return await documents.create({
            baby_id: babyId,
            title,
            type,
            file_path: filePath,
            file_type: file.type,
            file_size_bytes: file.size
        });
    },

    deleteDocument: async (docId) => {
        await documents.delete(docId);
    }
};

export default api;
