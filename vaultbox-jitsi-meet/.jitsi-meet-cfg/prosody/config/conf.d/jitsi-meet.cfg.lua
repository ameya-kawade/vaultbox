admins = {
    
    "jigasi@auth.meet.jitsi",
    

    
    "jibri@auth.meet.jitsi",
    

    "focus@auth.meet.jitsi",
    "jvb@auth.meet.jitsi"
}

unlimited_jids = {
    "focus@auth.meet.jitsi",
    "jvb@auth.meet.jitsi"
}

plugin_paths = { "/prosody-plugins/", "/prosody-plugins-custom", "/prosody-plugins-contrib" }

muc_mapper_domain_base = "meet.jitsi";
muc_mapper_domain_prefix = "muc";

http_default_host = "meet.jitsi"









consider_bosh_secure = true;
consider_websocket_secure = true;


smacks_max_unacked_stanzas = 5;
smacks_hibernation_time = 60;
smacks_max_old_sessions = 1;




VirtualHost "meet.jitsi"

  
  authentication = "token"
    app_id = "jitsi"
    app_secret = "fad423278067c42604841af69c9527699f693d39282341d506219f4860e4906e"
    allow_empty_token = false
    
    enable_domain_verification = false
  

    ssl = {
        key = "/config/certs/meet.jitsi.key";
        certificate = "/config/certs/meet.jitsi.crt";
    }
    modules_enabled = {
        "bosh";
        
        "websocket";
        "smacks"; -- XEP-0198: Stream Management
        
        "speakerstats";
        "conference_duration";
        "room_metadata";
        
        "end_conference";
        
        
        
        "muc_lobby_rooms";
        
        
        "muc_breakout_rooms";
        
        
        "av_moderation";
        
        
        
        
        
    }

    main_muc = "muc.meet.jitsi"
    room_metadata_component = "metadata.meet.jitsi"
    
    lobby_muc = "lobby.meet.jitsi"
    
    

    

    
    breakout_rooms_muc = "breakout.meet.jitsi"
    

    speakerstats_component = "speakerstats.meet.jitsi"
    conference_duration_component = "conferenceduration.meet.jitsi"

    
    end_conference_component = "endconference.meet.jitsi"
    

    
    av_moderation_component = "avmoderation.meet.jitsi"
    

    c2s_require_encryption = true

    

    
VirtualHost "guest.meet.jitsi"
    authentication = "jitsi-anonymous"
    modules_enabled = {
        
        "smacks"; -- XEP-0198: Stream Management
        
    }

    c2s_require_encryption = true
    



VirtualHost "auth.meet.jitsi"
    ssl = {
        key = "/config/certs/auth.meet.jitsi.key";
        certificate = "/config/certs/auth.meet.jitsi.crt";
    }
    modules_enabled = {
        "limits_exception";
    }
    authentication = "internal_hashed"



Component "internal-muc.meet.jitsi" "muc"
    storage = "memory"
    modules_enabled = {
        }
    restrict_room_creation = true
    muc_filter_whitelist="auth.meet.jitsi"
    muc_room_locking = false
    muc_room_default_public_jids = true
    muc_room_cache_size = 1000
    muc_tombstones = false
    muc_room_allow_persistent = false

Component "muc.meet.jitsi" "muc"
    restrict_room_creation = true
    storage = "memory"
    modules_enabled = {
        "muc_meeting_id";
        "token_verification";
        
        "polls";
        "muc_domain_mapper";
        
        "muc_password_whitelist";
    }

    -- The size of the cache that saves state for IP addresses
    rate_limit_cache_size = 10000;

    muc_room_cache_size = 10000
    muc_room_locking = false
    muc_room_default_public_jids = true
    
    muc_password_whitelist = {
        "focus@auth.meet.jitsi";
    }
    muc_tombstones = false
    muc_room_allow_persistent = false

Component "focus.meet.jitsi" "client_proxy"
    target_address = "focus@auth.meet.jitsi"

Component "speakerstats.meet.jitsi" "speakerstats_component"
    muc_component = "muc.meet.jitsi"

Component "conferenceduration.meet.jitsi" "conference_duration_component"
    muc_component = "muc.meet.jitsi"


Component "endconference.meet.jitsi" "end_conference"
    muc_component = "muc.meet.jitsi"



Component "avmoderation.meet.jitsi" "av_moderation_component"
    muc_component = "muc.meet.jitsi"



Component "lobby.meet.jitsi" "muc"
    storage = "memory"
    restrict_room_creation = true
    muc_tombstones = false
    muc_room_allow_persistent = false
    muc_room_cache_size = 10000
    muc_room_locking = false
    muc_room_default_public_jids = true
    modules_enabled = {
        }

    


Component "breakout.meet.jitsi" "muc"
    storage = "memory"
    restrict_room_creation = true
    muc_room_cache_size = 10000
    muc_room_locking = false
    muc_room_default_public_jids = true
    muc_tombstones = false
    muc_room_allow_persistent = false
    modules_enabled = {
        "muc_meeting_id";
        "polls";
        }


Component "metadata.meet.jitsi" "room_metadata_component"
    muc_component = "muc.meet.jitsi"
    breakout_rooms_component = "breakout.meet.jitsi"



