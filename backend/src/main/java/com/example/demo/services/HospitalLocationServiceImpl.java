package com.example.demo.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.dto.HospitalLocationDTO;
import com.example.demo.entities.HospitalLocation;
import com.example.demo.repository.HospitalLocationRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class HospitalLocationServiceImpl implements HospitalLocationService {

    private final HospitalLocationRepository repository;

    public HospitalLocationServiceImpl(HospitalLocationRepository repository) {
        this.repository = repository;
    }

    @Override
    public HospitalLocationDTO getLocation() {
        List<HospitalLocation> locations = repository.findAll();
        if (locations.isEmpty()) return null;
        HospitalLocation loc = locations.get(0); // only one location
        return new HospitalLocationDTO(loc.getLat(), loc.getLng());
    }

    @Override
    public HospitalLocationDTO saveOrUpdateLocation(HospitalLocationDTO locationDTO) {
        List<HospitalLocation> locations = repository.findAll();
        HospitalLocation loc;
        if (locations.isEmpty()) {
            loc = new HospitalLocation();
        } else {
            loc = locations.get(0); // update existing
        }
        loc.setLat(locationDTO.getLat());
        loc.setLng(locationDTO.getLng());

        HospitalLocation saved = repository.save(loc);
        return new HospitalLocationDTO(saved.getLat(), saved.getLng());
    }
}
